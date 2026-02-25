// tests/core/mvcs/service/AssetService.test.ts
import { Assets, Cache, Texture } from 'pixi.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetService } from '../../../../src/core/mvcs/service/AssetService';

describe('AssetService', () => {
    let service: AssetService;
    let mockRenderer: any;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.restoreAllMocks();
        service = new AssetService();

        mockRenderer = {
            generateTexture: vi.fn().mockReturnValue({
                destroy: vi.fn()
            })
        };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should initialize the Pixi Assets system', async () => {
        const initSpy = vi.spyOn(Assets, 'init');
        await service.init();
        expect(initSpy).toHaveBeenCalled();
    });

    describe('Remote Loading', () => {
        it('should load a remote texture successfully via Assets.load', async () => {
            const mockTex = { valid: true };
            const loadSpy = vi.spyOn(Assets, 'load').mockResolvedValue(mockTex);

            const result = await service.loadRemoteTexture('avatar', 'http://url.svg');

            expect(result).toBe(mockTex);
            expect(loadSpy).toHaveBeenCalledWith({
                src: 'http://url.svg',
                alias: 'avatar'
            });
        });

        it('should handle safeLoadRemoteTexture success', async () => {
            const loadSpy = vi.spyOn(service, 'loadRemoteTexture').mockResolvedValue({} as any);

            await service.safeLoadRemoteTexture('test-key', 'http://url.com', 3000);

            expect(loadSpy).toHaveBeenCalledWith('test-key', 'http://url.com');
        });

        it('should handle safeLoadRemoteTexture timeout gracefully', async () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            // Mock loadRemoteTexture to never resolve
            vi.spyOn(service, 'loadRemoteTexture').mockReturnValue(new Promise(() => { }));

            const safeLoadPromise = service.safeLoadRemoteTexture('timeout-key', 'url', 1000);

            // Advance time to trigger timeout
            await vi.advanceTimersByTimeAsync(1500);
            await safeLoadPromise;

            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Asset [timeout-key] skipped: Timeout'));
        });
    });

    describe('Cache Management', () => {
        it('should return a texture from cache if the alias exists', () => {
            vi.spyOn(Cache, 'has').mockReturnValue(true);
            const mockTex = { id: 'cached' };
            const fromSpy = vi.spyOn(Texture, 'from').mockReturnValue(mockTex as any);

            const result = service.getTexture('player-icon');

            expect(result).toBe(mockTex);
            expect(fromSpy).toHaveBeenCalledWith('player-icon');
        });

        it('should return "default" fallback if the alias is missing', () => {
            vi.spyOn(Cache, 'has').mockReturnValue(false);
            const mockDefault = { id: 'default' };
            const fromSpy = vi.spyOn(Texture, 'from').mockReturnValue(mockDefault as any);
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const result = service.getTexture('missing');

            expect(result).toBe(mockDefault);
            expect(fromSpy).toHaveBeenCalledWith('default');
            expect(warnSpy).toHaveBeenCalled();
        });
    });

    describe('Procedural Generation', () => {
        it('should orchestrate card generation', async () => {
            const cards = await service.getCards(mockRenderer);
            expect(Array.isArray(cards)).toBe(true);
        });

        it('should generate a flame texture', async () => {
            const texture = await service.getFlameTexture(mockRenderer);
            expect(texture).toBeDefined();
        });
    });
});