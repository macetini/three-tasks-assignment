import { beforeEach, describe, expect, jest, test } from '@jest/globals';

// 1. Mock pixi.js using your dummy file
jest.unstable_mockModule('pixi.js', () => import('./__mocks__/dummy.js' as any));

// 2. Dynamic imports
const { PrepareFlameCommand } = await import('../src/core/mvcs/controller/commands/PrepareFlameCommand');
const { ModelSignals } = await import('../src/core/signal/ModelSignals');

describe('PrepareFlameCommand', () => {
    let command: any;
    let mockAssetService: any;
    let mockModelMap: any;
    let mockSignalBus: any;
    let mockFlameModel: any;
    let mockRenderer: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockFlameModel = { setFlameTexture: jest.fn() };
        // Use the 'as any' cast to avoid the 'never' type error we saw earlier
        mockAssetService = {
            getFlameTexture: (jest.fn() as any).mockResolvedValue({ id: 'flame_tex' })
        };
        mockModelMap = { get: jest.fn().mockReturnValue(mockFlameModel) };
        mockSignalBus = { emit: jest.fn() };
        mockRenderer = { generateTexture: jest.fn() };

        command = new PrepareFlameCommand(mockRenderer);

        command.setDependencies({
            signalBus: mockSignalBus,
            assetService: mockAssetService,
            modelMap: mockModelMap
        });
    });

    test('execute() should fetch flame texture and update model', async () => {
        await command.execute();

        expect(mockAssetService.getFlameTexture).toHaveBeenCalledWith(mockRenderer);
        expect(mockFlameModel.setFlameTexture).toHaveBeenCalledWith({ id: 'flame_tex' });
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.FLAME_PREPARED);
    });

    test('execute() should throw and log error on failure', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        (mockAssetService.getFlameTexture as any).mockRejectedValue(new Error('Texture Bake Failed'));

        await expect(command.execute()).rejects.toThrow('Texture Bake Failed');
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});