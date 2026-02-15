import { beforeEach, describe, expect, jest, test } from '@jest/globals';

jest.unstable_mockModule('pixi.js', () =>
    // This cast to 'any' tells TS: "Don't look for a module definition, just import the file"
    import('./__mocks__/dummy.js' as any)
);

// 2. Global fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// 3. Dynamic imports
const { FetchMagicWordsCommand } = await import('../src/core/mvcs/controller/commands/FetchMagicWordsCommand');
const { ModelSignals } = await import('../src/core/signal/ModelSignals');

describe('FetchMagicWordsCommand', () => {
    let command: any;
    let mockAssetService: any;
    let mockModelMap: any;
    let mockSignalBus: any;
    let mockModel: any;

    const mockResponse = {
        emojies: [{ name: 'smile', url: 'smile.png' }],
        avatars: [{ name: 'ghost', url: 'ghost.png' }],
        dialogue: [{ name: 'ghost', text: 'Boo!' }]
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockModel = {
            setData: jest.fn(),
            setAvatarData: jest.fn(),
            setTextures: jest.fn()
        };

        mockAssetService = {
            // Cast to any to avoid 'never' error
            loadRemoteTexture: jest.fn(),
            getTexture: jest.fn(() => ({}))
        };
        (mockAssetService.loadRemoteTexture as any).mockResolvedValue({});

        mockModelMap = {
            get: jest.fn().mockReturnValue(mockModel)
        };

        mockSignalBus = {
            emit: jest.fn()
        };

        command = new FetchMagicWordsCommand(undefined);

        command.setDependencies({
            signalBus: mockSignalBus,
            assetService: mockAssetService,
            modelMap: mockModelMap
        });

        // Cast mockFetch to any to avoid 'never' error
        (mockFetch as any).mockResolvedValue({
            json: () => Promise.resolve(mockResponse)
        });
    });

    test('execute() should load assets, hydrate model, and emit signal', async () => {
        await command.execute();

        expect(mockAssetService.loadRemoteTexture).toHaveBeenCalledWith('default', expect.any(String));
        expect(mockFetch).toHaveBeenCalled();
        expect(mockAssetService.loadRemoteTexture).toHaveBeenCalledWith('smile', 'smile.png');
        expect(mockModel.setData).toHaveBeenCalled();
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.MAGIC_WORDS_LOADED);
    });

    test('execute() should log error on failure', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Cast mockFetch to any to avoid 'never' error
        (mockFetch as any).mockRejectedValue(new Error('Network Crash'));

        await command.execute();

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Setup failed'), expect.any(Error));
        consoleSpy.mockRestore();
    });
});