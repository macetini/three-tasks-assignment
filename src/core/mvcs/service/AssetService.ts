// src/core/mvcs/service/AssetService.ts
import { Assets, Color, Container, Graphics, Sprite, Texture, type Renderer } from 'pixi.js';
import { GameConfig } from '../../config/GameConfig';

export class AssetService {
    private readonly cfg = GameConfig.CARDS;

    /**
     * Bootstraps all assets. In a larger app, this would also 
     * handle Assets.load() for external manifests.
     */
    public async getCards(renderer: Renderer): Promise<Sprite[]> {
        await Assets.init();

        const outlineTexture: Texture = this.generateOutlineTexture(renderer);
        const cardTextures: Texture[] = this.generateMainTextures(renderer);
        return this.bakeCardTextures(renderer, outlineTexture, cardTextures);
    }

    private generateOutlineTexture(renderer: Renderer): Texture {
        console.log(`[AssetService] Generating Outline Texture.`);

        const width = this.cfg.WIDTH;
        const height = this.cfg.HEIGHT;

        const g = new Graphics();

        g.roundRect(0, 0, width, height, 10)
            .stroke({ width: 4, color: 0x000000, alignment: 0 });
        g.roundRect(0, 0, width, height, 10)
            .stroke({ width: 3, color: 0xffffff, alignment: 0 });

        const texture = renderer.generateTexture(g);
        g.destroy();

        return texture;
    }

    /**
     * Creates a pool of different card textures to ensure the 144-card 
     * stack looks organic and "limited edition."
     */
    private generateMainTextures(renderer: Renderer): Texture[] {
        console.log(`[AssetService] Generating '${this.cfg.TEMPLATES_COUNT}' card textures.`);
        const cardTextures: Texture[] = [];
        for (let i = 0; i < this.cfg.TEMPLATES_COUNT; i++) {
            const seed: number = i * Math.random();
            const voronoiTex = this.createVoronoiTexture(renderer, seed);
            cardTextures.push(voronoiTex);
        }
        console.log(`[AssetService] Finished Card Textures Generation: '${cardTextures.length}' cards generated.`);
        return cardTextures;
    }

    /**
 * Bakes a Voronoi-style pattern into a reusable GPU Texture.
 */
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
    * Creates deterministic "attractor" points with a vibrant, multi-color palette.
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
        g.rect(0, 0, width, height).fill({ color: 0x222222 });

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

    public bakeCardTextures(renderer: Renderer, outlineTexture: Texture, textures: Texture[]): Sprite[] {
        const bakedSprites: Sprite[] = [];
        const bakedContainer = new Container();

        const pattern = new Sprite({ anchor: 0.5 });
        const outline = new Sprite({ texture: outlineTexture, anchor: 0.5 });

        const width = this.cfg.WIDTH;
        const height = this.cfg.HEIGHT;
        pattern.position.set(width * 0.5, height * 0.5);
        outline.position.set(width * 0.5, height * 0.5);

        bakedContainer.addChild(pattern, outline);

        for (let i = 0; i < this.cfg.TOTAL_COUNT; i++) {
            pattern.texture = textures[i % this.cfg.TEMPLATES_COUNT];
            pattern.tint = this.getTint(i);

            const bakedTexture = renderer.generateTexture({
                target: bakedContainer,
                resolution: 1,
                antialias: true
            });

            const card = new Sprite(bakedTexture);
            card.anchor.set(0.5);
            bakedSprites.push(card);
        }

        bakedContainer.destroy({ children: true });
        return bakedSprites;
    }

    private getTint(index: number): number {
        const hue = (index * 137.508) % 360;
        return new Color({ h: hue, s: 80, v: 100 }).toNumber();
    }
}