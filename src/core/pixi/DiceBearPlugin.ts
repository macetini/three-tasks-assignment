// src/core/pixi/DiceBearPlugin.ts
import { ExtensionType, Texture, type LoaderParser } from 'pixi.js';

/**
 * PixiJS Extension Plugin: Dicebear SVG Parser.
 * Intercepts Dicebear URLs to handle them specifically as Image elements 
 * to bypass common SVG-to-Canvas rendering issues across different browsers.
 */
export const DiceBearPlugin: LoaderParser = {
    // Add the ID here to satisfy the interface
    id: 'diceBearParser',
    name: 'diceBearParser',

    extension: {
        type: ExtensionType.LoadParser,
        name: 'diceBearParser',
    },

    test: (url: string) => typeof url === 'string' && url.includes('dicebear'),

    /**
     * Loads a Dicebear image from a given URL.
     * @param src - The URL pointing to the Dicebear image.
     * @returns A promise that resolves to a Texture object or rejects with an error.
     */
    async load(src: string): Promise<Texture> {
        console.debug(`[DiceBearPlugin] Loading ${src}`);

        return new Promise((resolve, reject) => {
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