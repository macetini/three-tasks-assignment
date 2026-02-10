// src/core/mvcs/service/AssetService.ts
import { Assets, Graphics, Texture, type Renderer } from 'pixi.js';

export class AssetService {
    private readonly CARDS_POOL_SIZE = 10; // Generate 10 variations to keep memory low but variety high

    private readonly _cardTextures: Texture[] = [];
    public get cardTextures(): Texture[] {
        return this._cardTextures;
    }

    private _outlineTexture: Texture | null = null;
    public getOutlineTexture(): Texture {
        return this._outlineTexture!;
    }

    /**
     * Bootstraps all assets. In a larger app, this would also 
     * handle Assets.load() for external manifests.
     */
    public async initCardTemplates(renderer: Renderer): Promise<void> {
        await Assets.init();

        this.generateOutlineTexture(renderer);
        this.generateDeckTextures(renderer);
    }

    private generateOutlineTexture(renderer: Renderer): void {
        console.log(`[AssetService] Generating Outline Texture.`);
        const width = 200;
        const height = 280;
        const g = new Graphics();

        g.roundRect(0, 0, width, height, 10)
            .stroke({ width: 4, color: 0x000000, alignment: 0 });
        g.roundRect(0, 0, width, height, 10)
            .stroke({ width: 3, color: 0xffffff, alignment: 0 });

        const texture = renderer.generateTexture(g);
        g.destroy();

        this._outlineTexture = texture;
    }

    /**
     * Creates a pool of different card textures to ensure the 144-card 
     * stack looks organic and "limited edition."
     */
    private generateDeckTextures(renderer: Renderer): void {
        console.log(`[AssetService] Generating '${this.CARDS_POOL_SIZE}' card textures.`);
        for (let i = 0; i < this.CARDS_POOL_SIZE; i++) {
            const seed: number = i * Math.random();
            const voronoiTex = this.createVoronoiTexture(renderer, seed);
            this._cardTextures.push(voronoiTex);
        }
        console.log(`[AssetService] Finished Card Textures Generation: '${this._cardTextures.length}' cards generated.`);
    }

    /**
 * Bakes a Voronoi-style pattern into a reusable GPU Texture.
 */
    private createVoronoiTexture(renderer: Renderer, seed: number): Texture {
        const width = 200;
        const height = 280;
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
        const pointCount = 10;

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
        // 1. Solid Background
        g.rect(0, 0, width, height).fill({ color: 0x222222 });

        const centerX = width * 0.5;
        const centerY = height * 0.5;

        points.forEach((p, i) => {
            // Draw colorful triangles radiating from the center to the edges
            // This creates a "Star" or "Prism" effect
            g.moveTo(centerX, centerY)
                .lineTo(p.x, p.y)
                .lineTo(points[(i + 1) % points.length].x, points[(i + 1) % points.length].y)
                .closePath()
                .fill({ color: p.color, alpha: 0.8 });
        });

        // 2. Add a high-contrast border to make the card "pop"
        //g.roundRect(0, 0, width, height, 10).stroke({ width: 3, color: 0xffffff, alignment: 0 });
    }

    /**
     * For Task 2: We can use this to load specific fonts
     */
    public async loadFont(name: string, url: string): Promise<void> {
        await Assets.load({ alias: name, src: url });
    }
}