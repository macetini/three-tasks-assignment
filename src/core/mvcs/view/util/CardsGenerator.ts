// src/core/mvcs/view/util/CardsGenerator.ts
import { Color, Container, Graphics, Sprite, Texture, type Renderer } from "pixi.js";
import { GameConfig } from "../../../config/GameConfig";

export class CardsGenerator {
    private readonly cfg = GameConfig.CARDS;

    public generateOutlineTexture(renderer: Renderer): Texture {
        console.debug(`[AssetService] Generating Outline Texture.`);

        const width = this.cfg.WIDTH;
        const height = this.cfg.HEIGHT;

        const g = new Graphics();

        g.roundRect(0, 0, width, height, this.cfg.RECT_RADIUS)
            .stroke({ width: this.cfg.OUTLINE_THICKNESS, color: 0x000000, alignment: 0 });
        g.roundRect(0, 0, width, height, this.cfg.RECT_RADIUS)
            .stroke({ width: this.cfg.OUTLINE_THICKNESS - 1, color: 0xffffff, alignment: 0 });

        const texture = renderer.generateTexture(g);
        g.destroy();

        return texture;
    }

    /**
     * Creates a pool of different card textures to ensure the 144-card 
     * stack looks organic and "limited edition."
     */
    public generateMainTextures(renderer: Renderer): Texture[] {
        console.debug(`[AssetService] Generating '${this.cfg.TEMPLATES_COUNT}' card textures.`);
        const cardTextures: Texture[] = [];
        for (let i = 0; i < this.cfg.TEMPLATES_COUNT; i++) {
            const randomSeed = Math.floor(Math.random() * 1000000);
            const voronoiTex = this.createVoronoiTexture(renderer, randomSeed);
            cardTextures.push(voronoiTex);
        }
        console.debug(`[AssetService] Finished Card Textures Generation: '${cardTextures.length}' cards generated.`);
        return cardTextures;
    }

    private createVoronoiTexture(renderer: Renderer, seed: number): Texture {
        const width = this.cfg.WIDTH;
        const height = this.cfg.HEIGHT;
        const g = new Graphics();

        const points = this.generatePatternPoints(seed, width, height);
        this.drawVoronoiPattern(g, points, width, height);

        const texture = renderer.generateTexture(g);
        g.destroy();

        return texture;
    }


    /** 
     * Creates deterministic "attractor" points with a vibrant, multi - color palette.
    */
    private generatePatternPoints(seed: number, width: number, height: number) {
        const points = [];
        const pointCount = this.cfg.VORONOI_POINT_COUNT;

        for (let i = 0; i < pointCount; i++) {
            points.push({
                x: ((seed * 17 + i * 31) % 100) / 100 * width,
                y: ((seed * 13 + i * 23) % 100) / 100 * height,
                // Use shades of gray. Card tinting works best on grayscale!
                color: i % 2 === 0 ? 0xaaaaaa : 0xffffff
            });
        }
        return points;
    }

    /**
     * Handles the expensive pixel-looping to draw the cellular pattern.
     */
    private drawVoronoiPattern(g: Graphics, points: any[], width: number, height: number): void {
        g.rect(0, 0, width, height).fill({ color: 0x222222 }); // deep charcoal, good for tinting

        const centerX = width * 0.5;
        const centerY = height * 0.5;

        points.forEach((p, i) => {
            g.moveTo(centerX, centerY)
                .lineTo(p.x, p.y)
                .lineTo(points[(i + 1) % points.length].x, points[(i + 1) % points.length].y)
                .closePath()
                .fill({ color: p.color, alpha: 0.8 });
        });
    }

    public bakeCardTextures(renderer: Renderer, outlineTexture: Texture, templateTextures: Texture[]): Sprite[] {
        const bakedSprites: Sprite[] = [];

        const bakeContainer = new Container();
        const patternLayer = new Sprite();
        const outlineLayer = new Sprite(outlineTexture);

        patternLayer.anchor.set(0.5);
        outlineLayer.anchor.set(0.5);

        bakeContainer.addChild(patternLayer);
        bakeContainer.addChild(outlineLayer);

        for (let i = 0; i < this.cfg.TOTAL_COUNT; i++) {
            patternLayer.texture = templateTextures[i % this.cfg.TEMPLATES_COUNT];
            const randomSeed = Math.floor(Math.random() * 1000000);
            patternLayer.tint = this.getTint(randomSeed); // Tinting the pattern

            const finalTexture = renderer.generateTexture({
                target: bakeContainer,
                resolution: 1,
                antialias: true
            });

            const cardSprite = new Sprite(finalTexture);
            cardSprite.anchor.set(0.5);

            bakedSprites.push(cardSprite);
        }

        bakeContainer.destroy({ children: true });
        return bakedSprites;
    }

    private getTint(index: number): number {
        const hue = (index * 137.508) % 360;
        return new Color({ h: hue, s: 80, v: 100 }).toNumber();
    }
}