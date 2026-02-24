import { Cache } from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
        
        vi.spyOn(Cache, 'has').mockReturnValue(true);
        vi.spyOn(Cache, 'get').mockReturnValue({ mock: 'pixi-texture' } as any);

        command = new FetchMagicWordsCommand(undefined);
        (command as any).assetService = mockAssetService;
        (command as any).signalBus = mockSignalBus;
        (command as any).modelMap = mockModelMap;
    });

    it('should execute the full setup sequence successfully', async () => {
        await command.execute();

        // Check fail-safe asset loading
        expect(mockAssetService.loadRemoteTexture).toHaveBeenCalledWith('default', expect.any(String));

        // Check API call
        expect(globalThis.fetch).toHaveBeenCalled();

        // Check concurrent asset loading
        expect(mockAssetService.loadRemoteTexture).toHaveBeenCalledWith('smile', 'url1');
        expect(mockAssetService.loadRemoteTexture).toHaveBeenCalledWith('user1', 'url2');

        // Check model hydration
        expect(mockModel.setData).toHaveBeenCalledWith(expect.any(Array));
        expect(mockModel.setAvatarData).toHaveBeenCalledWith(mockApiResponse.avatars);
        expect(mockModel.setTextures).toHaveBeenCalled();

        // Check success signal
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.MAGIC_WORDS_LOADED);
    });

    it('should handle fetch errors gracefully', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network Fail'));

        await command.execute();

        expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Setup failed:'), expect.any(Error));
        expect(mockSignalBus.emit).not.toHaveBeenCalledWith(ModelSignals.MAGIC_WORDS_LOADED);
    });

    it('should only add textures to the map if they exist in Cache', async () => {
        // Mock Cache to return false for 'smile'
        vi.spyOn(Cache, 'has').mockImplementation((key) => key !== 'smile');

        await command.execute();

        const textureMap = mockModel.setTextures.mock.calls[0][0];
        expect(textureMap.has('smile')).toBe(false);
        expect(textureMap.has('user1')).toBe(true);
    });
});