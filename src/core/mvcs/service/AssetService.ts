// src/core/mvcs/service/AssetService.ts
import { Assets, Sprite, Texture, type Renderer } from 'pixi.js';
import { CardsGenerator } from '../view/util/CardsGenerator';

export class AssetService {
    private readonly cardsGenerator = new CardsGenerator();

    public async init(): Promise<void> {
        await Assets.init({});
        console.debug("[AssetService] Assets Service Initialized.");
    }

    /**
     * Bootstraps all assets. In a larger app, this would also 
     * handle Assets.load() for external manifests.
     */
    public async getCards(renderer: Renderer): Promise<Sprite[]> {
        const outlineTexture: Texture = this.cardsGenerator.generateOutlineTexture(renderer);
        const cardTextures: Texture[] = this.cardsGenerator.generateMainTextures(renderer);

        return this.cardsGenerator.bakeCardTextures(renderer, outlineTexture, cardTextures);
    }

    /**
     * Loads a texture from a URL and aliases it so it can be 
     * retrieved via Sprite.from(alias)
     */
    /**
     * Correct modern PIXI way to register a remote URL with an alias.
     */
    public async loadRemoteTexture(alias: string, url: string): Promise<Texture | null> {
        try {
            Assets.add({ alias, src: url });
            const texture = await Assets.load<Texture>(alias);

            return texture;
        } catch (error) {
            console.error(`[AssetService] Failed to load remote texture: ${alias}`, error);
            return null;
        }
    }
}