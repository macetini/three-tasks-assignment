import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { Sprite } from 'pixi.js';
import { CardModel } from '../src/core/mvcs/model/states/CardModel';
import { AceOfShadowsView } from '../src/core/mvcs/view/components/AceOfShadowsView';
import { AceOfShadowsMediator } from '../src/core/mvcs/view/mediators/AceOfShadowsMediator';
import { ModelSignals } from '../src/core/signal/ModelSignals';

describe('AceOfShadowsMediator', () => {
    let mediator: AceOfShadowsMediator;
    let mockView: AceOfShadowsView;
    let mockSignalBus: any;
    let mockModel: any;
    let mockModelMap: any;
    let mockApp: any;

    beforeEach(() => {
        // Setup Mock View (Initialized to avoid undefined internal containers)
        mockView = new AceOfShadowsView() as any;
        mockView.init();

        jest.spyOn(mockView, 'populateStack');
        jest.spyOn(mockView, 'stopStackingSequence');
        (mockView as any).onAddedToRoot = jest.fn();

        // Setup Mock SignalBus
        mockSignalBus = {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn()
        };
        // Setup Mock CardModel
        mockModel = {
            cards: [new Sprite(), new Sprite()]
        };
        // Setup ModelMap
        mockModelMap = {
            get: jest.fn().mockReturnValue(mockModel)
        };
        // Setup Mock Pixi App (Required by AbstractMediator)
        mockApp = {
            renderer: {
                on: jest.fn(),
                off: jest.fn()
            },
            screen: { width: 1024, height: 768 }
        };
        // Instantiate and Inject
        mediator = new AceOfShadowsMediator(mockView);
        (mediator as any).view = mockView;
        (mediator as any).signalBus = mockSignalBus;
        (mediator as any).modelMap = mockModelMap;
        (mediator as any).app = mockApp;
    });

    test('onRegister should listen for CARDS_PREPARED', () => {
        mediator.onRegister();
        expect(mockSignalBus.on).toHaveBeenCalledWith(
            ModelSignals.CARDS_PREPARED,
            expect.any(Function),
            mediator
        );
    });

    test('onViewAddedToRoot should emit PREPARE_CARDS with renderer', () => {
        (mediator as any).onViewAddedToRoot();

        expect(mockSignalBus.emit).toHaveBeenCalledWith(
            ModelSignals.PREPARE_CARDS,
            mockApp.renderer
        );
    });

    test('onCardsPrepared should populate the view stack with cards from model', () => {
        // Manually trigger the private callback
        (mediator as any).onCardsPrepared();

        expect(mockModelMap.get).toHaveBeenCalledWith(CardModel.NAME);
        expect(mockView.populateStack).toHaveBeenCalledWith(mockModel.cards);
    });

    test('onRemove should cleanup stacking sequence and signals', () => {
        mediator.onRemove();
        // Verify view cleanup
        expect(mockView.stopStackingSequence).toHaveBeenCalled();
        // Verify signal cleanup
        expect(mockSignalBus.off).toHaveBeenCalledWith(
            ModelSignals.CARDS_PREPARED,
            expect.any(Function)
        );
    });
});