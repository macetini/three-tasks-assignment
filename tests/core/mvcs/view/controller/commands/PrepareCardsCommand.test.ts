// src/core/mvcs/command/PrepareCardsCommand.test.ts
import { Sprite } from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrepareCardsCommand } from '../../../../../../src/core/mvcs/controller/commands/PrepareCardsCommand';
import { CardModel } from '../../../../../../src/core/mvcs/model/states/CardModel';
import { ModelSignals } from '../../../../../../src/core/signal/ModelSignals';

describe('PrepareCardsCommand', () => {
    let command: PrepareCardsCommand;
    let mockAssetService: any;
    let mockModelMap: any;
    let mockSignalBus: any;
    let mockCardModel: CardModel;
    let mockRenderer: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRenderer = { id: 'mock-renderer' };
    
        mockCardModel = new CardModel();
        vi.spyOn(mockCardModel, 'setCards');

        mockAssetService = {
            getCards: vi.fn().mockResolvedValue([new Sprite(), new Sprite()])
        };
        mockModelMap = {
            get: vi.fn().mockReturnValue(mockCardModel)
        };
        mockSignalBus = {
            emit: vi.fn()
        };
        
        command = new PrepareCardsCommand(mockRenderer);
        command.setDependencies({
            assetService: mockAssetService,
            modelMap: mockModelMap,
            signalBus: mockSignalBus
        });
    });

    it('should fetch cards from service and update model', async () => {
        await command.execute();

        expect(mockAssetService.getCards).toHaveBeenCalledWith(mockRenderer);        
        expect(mockCardModel.setCards).toHaveBeenCalledWith(expect.any(Array));
        expect(mockCardModel.cards.length).toBe(2);
    });

    it('should emit CARDS_PREPARED signal after successful preparation', async () => {
        await command.execute();        
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.CARDS_PREPARED);
    });

    it('should throw and log error if preparation fails', async () => {
        const error = new Error('Baking Failed');
        mockAssetService.getCards.mockRejectedValue(error);

        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        // Verify the error propagates
        await expect(command.execute()).rejects.toThrow('Baking Failed');
        expect(errorSpy).toHaveBeenCalled();

        errorSpy.mockRestore();
    });
});