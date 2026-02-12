// src/core/mvcs/view/util/CardsGenerator.ts
import { Color, Container, Graphics, Sprite, Texture, type Renderer } from "pixi.js";
import { GameConfig } from "../../../config/GameConfig";

/**
 * Procedural engine for card asset generation.
 * Handles the baking of 144 unique card textures using a layered approach:
 * 1. A master outline texture (reused).
 * 2. Randomized Voronoi pattern templates.
 * 3. Unique HSL-based tinting for every card in the deck.
 */
export class CardsGenerator {
    private readonly cfg = GameConfig.CARDS;

    /**
     * Generates a single outline texture for all cards.
     * The outline texture is a double-stroke shape with a black outer stroke
     * and a white inner stroke. This texture is used to create a visual
     * outline around each card sprite.
     * 
     * @param renderer - The active WebGL/WebGPU renderer used for texture baking.
     * 
     * @returns A promise resolving to a single Texture object containing the outline texture.
     */
    public generateOutlineTexture(renderer: Renderer): Texture {
        console.debug(`[AssetService] Generating Outline Texture.`);

        const width = this.cfg.WIDTH;
        const height = this.cfg.HEIGHT;

        const g = new Graphics();

        g.roundRect(0, 0, width, height, this.cfg.RECT_RADIUS)
            .stroke({ width: this.cfg.OUTLINE_THICKNESS, color: 'black', alignment: 0 });
        g.roundRect(0, 0, width, height, this.cfg.RECT_RADIUS)
            .stroke({ width: this.cfg.OUTLINE_THICKNESS - 1, color: 'white', alignment: 0 });

        const texture = renderer.generateTexture(g);
        g.destroy();

        return texture;
    }


    /**
     * Generates an array of procedurally generated card textures.
     * Each texture is generated using a random seed value to ensure uniqueness.
     * The number of textures generated is controlled by the GameConfig.CARDS.TEMPLATES_COUNT constant.
     * 
     * @param renderer - The active WebGL/WebGPU renderer used for texture baking.
     * 
     * @returns A promise resolving to an array of ready-to-render Sprites.
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

    /**
     * Creates a single card texture with a voronoi pattern.
     * 
     * @param renderer - The active WebGL/WebGPU renderer used for texture baking.
     * @param seed - The seed value used for generating the random points.
     * 
     * @returns A promise resolving to a single card texture.
     */
    private createVoronoiTexture(renderer: Renderer, seed: number): Texture {
        const width = this.cfg.WIDTH;
        const height = this.cfg.HEIGHT;
        const graphics = new Graphics();

        const points = this.generatePatternPoints(seed, width, height);
        this.drawVoronoiPattern(graphics, points, width, height);

        const texture = renderer.generateTexture(graphics);
        graphics.destroy();

        return texture;
    }


    /**
     * Generates an array of points with random positions and alternating gray colors.
     * Used for creating the voronoi pattern on the cards.
     * 
     * @param seed - The seed value used for generating the random points.
     * @param width - The width of the canvas.
     * @param height - The height of the canvas.
     * 
     * @returns An array of objects with x, y, and color properties.
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
     * Draws a voronoi pattern based on the provided points.
     * 
     * @param graphics - The Graphics instance to draw on.
     * @param points - The list of points to generate the voronoi pattern from.
     * @param width - The width of the canvas.
     * @param height - The height of the canvas.
     */
    private drawVoronoiPattern(graphics: Graphics, points: any[], width: number, height: number): void {
        graphics.rect(0, 0, width, height).fill({ color: 0x222222 }); // deep charcoal, good for tinting

        const centerX = width * 0.5;
        const centerY = height * 0.5;

        points.forEach((point, index) => {
            graphics.moveTo(centerX, centerY)
                .lineTo(point.x, point.y)
                .lineTo(points[(index + 1) % points.length].x, points[(index + 1) % points.length].y)
                .closePath()
                .fill({ color: point.color, alpha: 0.8 });
        });
    }

    /**
     * Bakes the 144-card stack textures by layering the outline and cellular
     * patterns, tinting the cellular pattern, and rendering the final texture.
     * 
     * @param renderer - The active renderer for baking the textures.
     * @param outlineTexture - The outline texture generated by the AssetService.
     * @param templateTextures - The array of different card textures generated by the AssetService.
     * 
     * @returns An array of 144 procedurally generated Sprite objects, each representing a single card.
     */
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

    /**
     * Generates a unique color tint based on an index.
     * The tint is a shade of gray with a hue that varies based on the index.
     * This tint is used to differentiate individual cards in the deck.
     * 
     * @param index - The index of the card to generate a tint for.
     * @returns The generated tint color in the format of a number representing a color in the format of 0xRRGGBB.
     */
    private getTint(index: number): number {
        const hue = (index * 137.508) % 360;
        return new Color({ h: hue, s: 80, v: 100 }).toNumber();
    }
}