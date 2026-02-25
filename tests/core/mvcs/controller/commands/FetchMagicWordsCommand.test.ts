import { Cache } from 'pixi.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FetchMagicWordsCommand } from '../../../../../src/core/mvcs/controller/commands/FetchMagicWordsCommand';
import { ModelSignals } from '../../../../../src/core/signal/ModelSignals';

describe('FetchMagicWordsCommand', () => {
    let command: FetchMagicWordsCommand;
    let mockAssetService: any;
    let mockSignalBus: any;
    let mockModelMap: any;
    let mockModel: any;

    const mockApiResponse = {
        emojies: [{ name: 'smile', url: 'url1' }],
        avatars: [{ name: 'user1', url: 'url2' }],
        dialogue: [{ name: 'user1', text: 'Hello world' }]
    };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.restoreAllMocks();

        // Mock API response
        globalThis.fetch = vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue(mockApiResponse)
        });

        // Mock AssetService with both strict and safe methods
        mockAssetService = {
            loadRemoteTexture: vi.fn().mockResolvedValue({ mock: 'texture' }),
            safeLoadRemoteTexture: vi.fn().mockResolvedValue(true)
        };

        // Mock Model and Signals
        mockSignalBus = { emit: vi.fn() };
        mockModel = {
            setData: vi.fn(),
            setAvatarData: vi.fn(),
            setTextures: vi.fn()
        };
        mockModelMap = {
            get: vi.fn().mockReturnValue(mockModel)
        };

        // Mock PIXI Cache
        vi.spyOn(Cache, 'has').mockReturnValue(true);
        vi.spyOn(Cache, 'get').mockReturnValue({ mock: 'pixi-texture' } as any);

        // Initialize Command and inject dependencies
        command = new FetchMagicWordsCommand(undefined);
        (command as any).assetService = mockAssetService;
        (command as any).signalBus = mockSignalBus;
        (command as any).modelMap = mockModelMap;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should execute the full parallel setup sequence successfully', async () => {
        await command.execute();

        // Check fail-safe asset (Strict load)
        expect(mockAssetService.loadRemoteTexture).toHaveBeenCalledWith('default', expect.any(String));

        // Check dynamic assets (Safe parallel loads)
        expect(mockAssetService.safeLoadRemoteTexture).toHaveBeenCalledWith('smile', 'url1', expect.any(Number));
        expect(mockAssetService.safeLoadRemoteTexture).toHaveBeenCalledWith('user1', 'url2', expect.any(Number));

        // Verify signal emitted
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.MAGIC_WORDS_LOADED);
    });

    it('should continue to hydrate model even if some safe loads return false', async () => {
        // Mock safeLoad to return false (failed/timeout) for one asset
        mockAssetService.safeLoadRemoteTexture.mockImplementation((key: string) => {
            return Promise.resolve(key !== 'smile');
        });

        await command.execute();

        // Hydration should still happen
        expect(mockModel.setData).toHaveBeenCalled();
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.MAGIC_WORDS_LOADED);
    });

    it('should implement architectural fallback to "default" texture in getTextureMap', async () => {
        const mockDefaultTexture = { name: 'default_tex' };

        // Simulate Cache missing 'user1' and 'smile' but having 'default'
        vi.spyOn(Cache, 'has').mockImplementation((key) => key === 'default');
        vi.spyOn(Cache, 'get').mockImplementation((key) => {
            if (key === 'default') return mockDefaultTexture as any;
            return undefined;
        });

        await command.execute();

        const textureMap: Map<string, any> = mockModel.setTextures.mock.calls[0][0];

        // Ensure missing keys point to the default texture
        expect(textureMap.get('user1')).toBe(mockDefaultTexture);
        expect(textureMap.get('smile')).toBe(mockDefaultTexture);
        expect(textureMap.get('default')).toBe(mockDefaultTexture);
    });

    it('should log an error and not emit success if the fetch fails', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        globalThis.fetch = vi.fn().mockRejectedValue(new Error('API Offline'));

        await command.execute();

        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Setup failed:'), expect.any(Error));
        expect(mockSignalBus.emit).not.toHaveBeenCalled();
    });
});