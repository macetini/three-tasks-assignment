import { Sprite } from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CardModel } from '../../../../../src/core/mvcs/model/states/CardModel';
import { AceOfShadowsView } from '../../../../../src/core/mvcs/view/components/AceOfShadowsView';
import { AceOfShadowsMediator } from '../../../../../src/core/mvcs/view/mediators/AceOfShadowsMediator';
import { ModelSignals } from '../../../../../src/core/signal/ModelSignals';

describe('AceOfShadowsMediator', () => {
    let mediator: AceOfShadowsMediator;
    let mockView: AceOfShadowsView;
    let mockSignalBus: any;
    let mockModelMap: any;
    let mockApp: any;

    beforeEach(() => {
        mockView = new AceOfShadowsView();
        vi.spyOn(mockView, 'populateStack');
        vi.spyOn(mockView, 'stopStackingSequence');

        mockSignalBus = {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn()
        };

        const realCardModel = new CardModel();
        const mockCards = [new Sprite(), new Sprite()];
        realCardModel.setCards(mockCards);

        mockModelMap = {
            get: vi.fn().mockReturnValue(realCardModel)
        };

        mockApp = { renderer: { type: 'mock-renderer' } };

        mediator = new AceOfShadowsMediator(mockView);

        // Inject dependencies
        (mediator as any).view = mockView;
        (mediator as any).signalBus = mockSignalBus;
        (mediator as any).modelMap = mockModelMap;
        (mediator as any).app = mockApp;
    });

    it('should register listener for CARDS_PREPARED on register', () => {
        mediator.onRegister();
        expect(mockSignalBus.on).toHaveBeenCalledWith(
            ModelSignals.CARDS_PREPARED,
            expect.any(Function),
            mediator
        );
    });

    it('should emit PREPARE_CARDS when view is added to root', () => {
        (mediator as any).onViewAddedToRoot();
        expect(mockSignalBus.emit).toHaveBeenCalledWith(
            ModelSignals.PREPARE_CARDS,
            mockApp.renderer
        );
    });

    it('should populate view stack when cards are prepared', () => {
        mediator.onRegister();

        // Manually trigger the private onCardsPrepared via the signal bus logic
        const callback = mockSignalBus.on.mock.calls.find(
            (call: any) => call[0] === ModelSignals.CARDS_PREPARED
        )[1];

        callback.call(mediator);

        expect(mockModelMap.get).toHaveBeenCalledWith(CardModel.NAME);
        expect(mockView.populateStack).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should cleanup view and listeners on remove', () => {
        mediator.onRemove();
        expect(mockView.stopStackingSequence).toHaveBeenCalled();
        expect(mockSignalBus.off).toHaveBeenCalledWith(
            ModelSignals.CARDS_PREPARED,
            expect.any(Function)
        );
    });
});