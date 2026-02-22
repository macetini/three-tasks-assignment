// src/core/mvcs/service/AssetService.ts
import { Assets, Cache, Sprite, Texture, type Renderer } from 'pixi.js';
import { CardsGenerator } from '../view/util/CardsGenerator';
import { FireGenerator } from '../view/util/FireGenerator';

/**
 * Service responsible for asset management, remote loading, and 
 * procedural texture generation. It acts as the gateway between 
 * the hardware (Renderer) and the application's graphic requirements.
 */
export class AssetService {
    private readonly cardsGenerator = new CardsGenerator();
    private readonly fireGenerator = new FireGenerator();

    /**
     * Initializes the PixiJS Assets system.
     */
    public async init(): Promise<void> {
        await Assets.init({});

        console.debug("[AssetService] Assets Service Initialized.");
    }

    /**
     * Orchestrates the procedural generation of the 144-card stack.
     * 
     * @param renderer - The active WebGL/WebGPU renderer used for texture baking.
     * 
     * @returns A promise resolving to an array of ready-to-render Sprites.
     */
    public async getCards(renderer: Renderer): Promise<Sprite[]> {
        const outlineTexture: Texture = this.cardsGenerator.generateOutlineTexture(renderer);
        const cardTextures: Texture[] = this.cardsGenerator.generateMainTextures(renderer);

        return this.cardsGenerator.bakeCardTextures(renderer, outlineTexture, cardTextures);
    }

    /**
     * Generates a single procedural texture for the fire particle system.
     * 
     * @param renderer - The active renderer for baking the noise/gradient texture.
     */
    public async getFlameTexture(renderer: Renderer): Promise<Texture> {
        return this.fireGenerator.generateFlameTexture(renderer);
    }

    /**
     * Loads a remote asset via URL and stores it in the Pixi Cache under an alias.
     * Utilizes the diceBearPlugin for SVG-based avatar URLs.
     * 
     * @param alias - The key used to retrieve the texture later.
     * @param url - The remote address of the asset.
     * 
     * @returns The loaded Texture or null if the request failed.
     */
    public async loadRemoteTexture(alias: string, url: string): Promise<Texture | null> {
        try {
            // Now Assets.load will use our plugin automatically!
            const texture = await Assets.load<Texture>({
                src: url,
                alias: alias
            });
            return texture;
        } catch (error) {
            console.error(`[AssetService] Error: ${alias}`, error);
            return null;
        }
    }

    /**
     * Synchronous retrieval of a texture from the internal cache.
     * Provides a fallback mechanism to prevent runtime rendering crashes.
     * 
     * @param alias - The alias/key to look up.
     * @returns The requested Texture or the 'default' fallback.
     */
    public getTexture(alias: string): Texture {
        if (Cache.has(alias)) {
            return Texture.from(alias);
        }

        console.warn(`[AssetService] Asset ${alias} not found. Falling back to default.`);
        return Texture.from("default");
    }
}
