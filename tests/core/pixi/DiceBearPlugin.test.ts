import { Texture } from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DiceBearPlugin } from '../../../src/core/pixi/DiceBearPlugin';

describe('DiceBearPlugin', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should test true for URLs containing "dicebear"', () => {
        expect(DiceBearPlugin.test!('https://api.dicebear.com/test')).toBe(true);
    });

    it('should successfully load an image and return a Texture', async () => {
        const mockImage = {
            _src: '',
            set src(val: string) {
                this._src = val;
                setTimeout(() => this.onload(), 10);
            },
            onload: () => { },
            onerror: () => { },
            crossOrigin: ''
        };

        // Use a function declaration for the constructor
        vi.stubGlobal('Image', vi.fn(function () {
            return mockImage;
        }));

        const mockTexture = { label: 'dicebear' } as any;
        vi.spyOn(Texture, 'from').mockReturnValue(mockTexture);

        const result = await DiceBearPlugin.load!('https://api.dicebear.com/test');

        expect(result).toBe(mockTexture);
        expect(mockImage.crossOrigin).toBe('anonymous');
    });

    it('should reject if image fails to load', async () => {
        const mockImage = {
            set src(_val: string) {
                setTimeout(() => this.onerror(), 10);
            },
            onload: () => { },
            onerror: () => { },
            crossOrigin: ''
        };

        // Use a function declaration for the constructor
        vi.stubGlobal('Image', vi.fn(function () {
            return mockImage;
        }));

        await expect(DiceBearPlugin.load!('https://api.dicebear.com/fail'))
            .rejects.toThrow('DiceBear load failed');
    });

    it('should destroy texture on unload', () => {
        const mockTexture = { destroy: vi.fn() } as any;
        DiceBearPlugin.unload!(mockTexture);
        expect(mockTexture.destroy).toHaveBeenCalledWith(true);
    });
});