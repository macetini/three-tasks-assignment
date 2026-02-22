// tests/core/mvcs/service/AssetService.test.ts
import { Assets, Cache, Texture } from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetService } from '../../../../src/core/mvcs/service/AssetService';

describe('AssetService', () => {
    let service: AssetService;
    let mockRenderer: any;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new AssetService();

        mockRenderer = {
            generateTexture: vi.fn().mockReturnValue({
                destroy: vi.fn()
            })
        };
    });

    it('should initialize the Pixi Assets system', async () => {
        const initSpy = vi.spyOn(Assets, 'init');
        await service.init();
        expect(initSpy).toHaveBeenCalled();
    });

    describe('Procedural Generation', () => {
        it('should orchestrate card generation by calling internal generators', async () => {
            const cards = await service.getCards(mockRenderer);

            expect(Array.isArray(cards)).toBe(true);
            // Verify that the renderer was actually used to bake textures
            expect(mockRenderer.generateTexture).toHaveBeenCalled();
        });

        it('should generate a flame texture', async () => {
            const texture = await service.getFlameTexture(mockRenderer);

            expect(texture).toBeDefined();
            expect(mockRenderer.generateTexture).toHaveBeenCalled();
        });
    });

    describe('Remote Loading', () => {
        it('should load a remote texture successfully via Assets.load', async () => {
            const mockTex = { valid: true };
            const loadSpy = vi.spyOn(Assets, 'load').mockResolvedValue(mockTex);

            const result = await service.loadRemoteTexture('avatar', 'http://dicebear.com/1.svg');

            expect(result).toBe(mockTex);
            expect(loadSpy).toHaveBeenCalledWith({
                src: 'http://dicebear.com/1.svg',
                alias: 'avatar'
            });
        });

        it('should return null and log an error if loading fails', async () => {
            vi.spyOn(Assets, 'load').mockRejectedValue(new Error('404 Not Found'));
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const result = await service.loadRemoteTexture('fail', 'bad-url');

            expect(result).toBeNull();
            expect(errorSpy).toHaveBeenCalled();

            errorSpy.mockRestore();
        });
    });

    describe('Cache Management', () => {
        it('should return a texture from cache if the alias exists', () => {
            vi.spyOn(Cache, 'has').mockReturnValue(true);
            const fromSpy = vi.spyOn(Texture, 'from').mockReturnValue({ id: 'cached' } as any);

            const result = service.getTexture('player-icon');

            expect(result).toBeDefined();
            expect(fromSpy).toHaveBeenCalledWith('player-icon');
        });

        it('should return a "default" fallback texture if the alias is missing', () => {
            vi.spyOn(Cache, 'has').mockReturnValue(false);
            const mockDefaultTexture = { id: 'default' } as any;
            const fromSpy = vi.spyOn(Texture, 'from').mockReturnValue(mockDefaultTexture);
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const result = service.getTexture('non-existent');

            // Assertion added here to use the 'result' variable
            expect(result).toBe(mockDefaultTexture);
            expect(fromSpy).toHaveBeenCalledWith('default');
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));

            warnSpy.mockRestore();
        });
    });
});