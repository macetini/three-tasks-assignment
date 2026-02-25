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
        vi.useFakeTimers(); // Essential for testing the 3.5s timeout
        vi.restoreAllMocks();

        globalThis.fetch = vi.fn().mockResolvedValue({
            json: vi.fn().mockResolvedValue(mockApiResponse)
        });

        mockAssetService = {
            loadRemoteTexture: vi.fn().mockResolvedValue({ mock: 'texture' })
        };

        mockSignalBus = { emit: vi.fn() };

        mockModel = {
            setData: vi.fn(),
            setAvatarData: vi.fn(),
            setTextures: vi.fn()
        };
        mockModelMap = {
            get: vi.fn().mockReturnValue(mockModel)
        };

        // Default Cache behavior: everything exists
        vi.spyOn(Cache, 'has').mockReturnValue(true);
        vi.spyOn(Cache, 'get').mockReturnValue({ mock: 'pixi-texture' } as any);

        command = new FetchMagicWordsCommand(undefined);
        (command as any).assetService = mockAssetService;
        (command as any).signalBus = mockSignalBus;
        (command as any).modelMap = mockModelMap;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should execute the full setup sequence successfully', async () => {
        await command.execute();

        expect(mockAssetService.loadRemoteTexture).toHaveBeenCalledWith('default', expect.any(String));
        expect(globalThis.fetch).toHaveBeenCalled();
        expect(mockModel.setData).toHaveBeenCalled();
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.MAGIC_WORDS_LOADED);
    });

    it('should handle individual asset timeouts gracefully and continue', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        // Mock one asset to hang forever
        mockAssetService.loadRemoteTexture.mockImplementation((key: string) => {
            if (key === 'smile') return new Promise(() => { }); // Never resolves
            return Promise.resolve({ mock: 'texture' });
        });

        const executePromise = command.execute();

        // Fast-forward time to trigger the 3.5s timeout
        await vi.advanceTimersByTimeAsync(4000);
        await executePromise;

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Asset [smile] skipped: Timeout'));
        // Crucial: The command should still finish and emit success
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.MAGIC_WORDS_LOADED);
    });

    it('should fallback to "default" texture if an asset is missing from Cache', async () => {
        // 'default' exists, but 'user1' failed to load/cache
        vi.spyOn(Cache, 'has').mockImplementation((key) => key === 'default');

        const mockDefaultTexture = { name: 'default_tex' };
        vi.spyOn(Cache, 'get').mockImplementation((key) => {
            if (key === 'default') return mockDefaultTexture as any;
            return null;
        });

        await command.execute();

        const textureMap: Map<string, any> = mockModel.setTextures.mock.calls[0][0];

        // Even though user1 failed, it should have the default texture in the map
        expect(textureMap.get('user1')).toBe(mockDefaultTexture);
        expect(textureMap.get('smile')).toBe(mockDefaultTexture);
    });

    it('should handle fetch errors gracefully', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network Fail'));

        await command.execute();

        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Setup failed:'), expect.any(Error));
        expect(mockSignalBus.emit).not.toHaveBeenCalledWith(ModelSignals.MAGIC_WORDS_LOADED);
    });
});