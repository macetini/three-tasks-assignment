import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { AceOfShadowsView } from '../src/core/mvcs/view/components/AceOfShadowsView';
import { MainMenuView } from '../src/core/mvcs/view/components/MainMenuView';
import { RootView } from '../src/core/mvcs/view/components/RootView';
import { RootViewMediator } from '../src/core/mvcs/view/mediators/RootViewMediator';
import { ModelSignals } from '../src/core/signal/ModelSignals';
import { TaskSignals } from '../src/core/signal/TaskSignals';

describe('RootViewMediator', () => {
    let mediator: RootViewMediator;
    let mockView: RootView;
    let mockSignalBus: any;
    let mockMediatorMap: any;
    let mockApp: any;

    beforeEach(() => {
        // Setup Mock RootView
        mockView = new RootView() as any;
        jest.spyOn(mockView, 'setView');
        // Define activeView as a getter for testing
        Object.defineProperty(mockView, 'activeView', {
            get: jest.fn(() => null),
            configurable: true
        });

        // Mock Services
        mockSignalBus = {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn()
        };

        mockMediatorMap = {
            register: jest.fn(),
            unregister: jest.fn()
        };

        mockApp = {
            renderer: { on: jest.fn(), off: jest.fn() },
            screen: { width: 1024, height: 768 }
        };

        // Instantiate and Inject
        mediator = new RootViewMediator(mockView);
        (mediator as any).view = mockView;
        (mediator as any).signalBus = mockSignalBus;
        (mediator as any).mediatorMap = mockMediatorMap;
        (mediator as any).app = mockApp;
    });

    test('onRegister should initialize Main Menu and listen for task switches', () => {
        const initMenuSpy = jest.spyOn(mediator as any, 'initMainMenu');

        mediator.onRegister();

        expect(initMenuSpy).toHaveBeenCalled();
        expect(mockSignalBus.on).toHaveBeenCalledWith(
            ModelSignals.SWITCH_TASK,
            (mediator as any).onSwitchTask
        );
    });

    test('onSwitchTask should create new View and register it', () => {
        // Simulate switching to CARDS
        (mediator as any).onSwitchTask(TaskSignals.CARDS);
        // Verify Mediator logic
        expect(mockMediatorMap.register).toHaveBeenCalledWith(expect.any(AceOfShadowsView));
        expect(mockView.setView).toHaveBeenCalledWith(expect.any(AceOfShadowsView));
    });

    test('addAndRegister should unregister the previous view if it exists', () => {
        const oldView = new MainMenuView();
        // Mock the getter to return an old view
        jest.spyOn(mockView, 'activeView', 'get').mockReturnValue(oldView);

        const newView = new AceOfShadowsView();
        (mediator as any).addAndRegister(newView);

        // Ensure the old mediator is removed before the new one is added
        expect(mockMediatorMap.unregister).toHaveBeenCalledWith(oldView);
        expect(mockMediatorMap.register).toHaveBeenCalledWith(newView);
    });

    test('onSwitchTask should warn and do nothing if task type is unknown', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

        (mediator as any).onSwitchTask('NON_EXISTENT_TASK');

        expect(warnSpy).toHaveBeenCalled();
        expect(mockMediatorMap.register).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    test('onRemove should clean up signals', () => {
        mediator.onRemove();
        expect(mockSignalBus.off).toHaveBeenCalledWith(
            ModelSignals.SWITCH_TASK,
            (mediator as any).onSwitchTask
        );
    });
});