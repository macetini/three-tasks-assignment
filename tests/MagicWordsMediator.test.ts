import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { MagicWordsView } from '../src/core/mvcs/view/components/MagicWordsView';
import { MagicWordsMediator } from '../src/core/mvcs/view/mediators/MagicWordsMediator';
import { ModelSignals } from '../src/core/signal/ModelSignals';

describe('MagicWordsMediator', () => {
    let mediator: MagicWordsMediator;
    let mockView: any;
    let mockSignalBus: any;
    let mockModel: any;
    let mockModelMap: any;

    beforeEach(() => {
        // Setup Mock View
        mockView = new MagicWordsView() as any;
        mockView.init();
        
        // Spies allow us to track calls without breaking the original mock logic
        jest.spyOn(mockView, 'showLoading');
        jest.spyOn(mockView, 'hideLoading');
        jest.spyOn(mockView, 'buildRows');
        jest.spyOn(mockView, 'layout');
        
        // Add the missing method the AbstractMediator wants
        mockView.onAddedToRoot = jest.fn();

        // Setup Mock SignalBus
        mockSignalBus = {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn()
        };

        // Setup Mock Model
        mockModel = {
            words: [{
                characterName: 'Bernadette',
                text: 'Hello!',
                // Add this tokens array to stop the forEach crash
                tokens: [
                    { type: 'text', value: 'Hello!' }
                ]
            }],
            getTexture: jest.fn().mockReturnValue({}), // Returns a dummy Texture
            getPosition: jest.fn().mockReturnValue({ x: 0, y: 0 })
        };

        // Setup ModelMap
        mockModelMap = {
            get: jest.fn().mockReturnValue(mockModel)
        };

        // Setup Mock Pixi App
        const mockApp = {
            renderer: {
                on: jest.fn(),
                off: jest.fn()
            },
            screen: { width: 1024, height: 768 }
        };

        mediator = new MagicWordsMediator(mockView);
        (mediator as any).view = mockView;
        (mediator as any).signalBus = mockSignalBus;
        (mediator as any).modelMap = mockModelMap;
        (mediator as any).app = mockApp;
    });

    test('onRegister should listen for MAGIC_WORDS_LOADED', () => {
        mediator.onRegister();
        expect(mockSignalBus.on).toHaveBeenCalledWith(
            ModelSignals.MAGIC_WORDS_LOADED,
            expect.any(Function),
            mediator
        );
    });

    test('onViewAddedToRoot should show loading and fetch data', () => {
        // We cast to any to call protected/private methods
        (mediator as any).onViewAddedToRoot();

        expect(mockView.showLoading).toHaveBeenCalled();
        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.FETCH_MAGIC_WORDS);
    });

    test('onWordsLoaded should hide loading and build view rows', () => {
        // Manually trigger the private callback
        (mediator as any).onWordsLoaded();

        expect(mockView.hideLoading).toHaveBeenCalled();
        expect(mockView.buildRows).toHaveBeenCalledWith(
            mockModel.words,
            expect.objectContaining({
                textureProvider: expect.any(Function),
                positionProvider: expect.any(Function)
            })
        );
    });

    test('onRemove should clean up listeners', () => {
        mediator.onRemove();
        expect(mockSignalBus.off).toHaveBeenCalledWith(
            ModelSignals.MAGIC_WORDS_LOADED,
            expect.any(Function)
        );
    });
});