import { beforeEach, describe, expect, jest, test } from '@jest/globals';

// 1. Mock pixi.js using your dummy file
jest.unstable_mockModule('pixi.js', () => import('./__mocks__/dummy.js' as any));

// 2. Dynamic imports
const { PrepareCardsCommand } = await import('../src/core/mvcs/controller/commands/PrepareCardsCommand');
const { ModelSignals } = await import('../src/core/signal/ModelSignals');

describe('PrepareCardsCommand', () => {
    let command: any;
    let mockAssetService: any;
    let mockModelMap: any;
    let mockSignalBus: any;
    let mockCardModel: any;
    let mockRenderer: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockCardModel = { setCards: jest.fn() };

        // Fix: Cast the jest.fn() to any so mockResolvedValue accepts the array
        mockAssetService = {
            getCards: (jest.fn() as any).mockResolvedValue([])
        };

        mockModelMap = { get: jest.fn().mockReturnValue(mockCardModel) };
        mockSignalBus = { emit: jest.fn() };
        mockRenderer = { generateTexture: jest.fn() };

        command = new PrepareCardsCommand(mockRenderer);

        command.setDependencies({
            signalBus: mockSignalBus,
            assetService: mockAssetService,
            modelMap: mockModelMap
        });
    });

    test('execute() should fetch cards using the renderer and update model', async () => {
        await command.execute();

        // Verify service was called with the renderer from the payload
        expect(mockAssetService.getCards).toHaveBeenCalledWith(mockRenderer);

        // Verify model was updated
        expect(mockCardModel.setCards).toHaveBeenCalled();

        // Verify completion signal
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.CARDS_PREPARED);
    });

    test('execute() should throw and log error on failure', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        (mockAssetService.getCards as any).mockRejectedValue(new Error('Bake Failed'));

        await expect(command.execute()).rejects.toThrow('Bake Failed');
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});