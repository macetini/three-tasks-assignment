// src/core/mvcs/service/AssetService.ts
import { extensions, Assets, ExtensionType, Sprite, Texture, type Renderer, Cache } from 'pixi.js';
import { CardsGenerator } from '../view/util/CardsGenerator';

// Plugin for Dicebear
const diceBearPlugin = {
    extension: {
        type: ExtensionType.LoadParser,
        name: 'diceBearParser',
    },
    // Only intercept URLs that come from dicebear
    test: (url: string) => typeof url === 'string' && url.includes('dicebear'),

    async load(src: string) {
        return new Promise<Texture>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(Texture.from(img));
            img.onerror = () => reject(new Error(`DiceBear load failed: ${src}`));
            img.src = src;
        });
    },
    unload(texture: Texture) {
        texture.destroy(true);
    }
};
// Register the plugin
extensions.add(diceBearPlugin);
//

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
}
