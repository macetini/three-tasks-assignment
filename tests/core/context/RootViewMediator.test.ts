import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RootViewMediator } from '../../../src/core/mvcs/view/mediators/RootViewMediator';
import { ModelSignals } from '../../../src/core/signal/ModelSignals';
import { SignalBus } from '../../../src/core/signal/SignalBus';
import { TaskSignals } from '../../../src/core/signal/TaskSignals';

// tests/core/mvcs/view/mediator/RootViewMediator.test.ts

describe('RootViewMediator', () => {
    let mediator: RootViewMediator;
    let mockView: any;

    beforeEach(() => {
        // Minimum mock required by the interface
        mockView = {
            setView: vi.fn(),
            activeView: null,
            emit: vi.fn(),
            once: vi.fn(),
            onAddedToRoot: vi.fn(),
            layout: vi.fn()
        };

        mediator = new RootViewMediator(mockView);
        mediator.setSignalBus(new SignalBus());
        mediator.setMediatorMap({
            register: vi.fn(),
            unregister: vi.fn()
        } as any);
    });

    it('should successfully register and initialize main menu without crashing', () => {
        mediator.onRegister();
        expect(mockView.setView).toHaveBeenCalled();
    });

    it('should respond to task switch signals', () => {
        const registerSpy = vi.spyOn(mediator['mediatorMap'], 'register');
        mediator.onRegister();
        (mediator as any).signalBus.emit(ModelSignals.SWITCH_TASK, TaskSignals.CARDS);
        expect(registerSpy).toHaveBeenCalled();
    });

    it('should not crash or register anything if an unknown task type is received', () => {
        const registerSpy = vi.spyOn(mediator['mediatorMap'], 'register');
        mediator.onRegister();
        (mediator as any).signalBus.emit(ModelSignals.SWITCH_TASK, 'NON_EXISTENT_TASK');
        expect(registerSpy).toHaveBeenCalledTimes(1);
    });

    it('should stop listening to signals after onRemove is called', () => {
        const signalOffSpy = vi.spyOn((mediator as any).signalBus, 'off');
        const registerSpy = vi.spyOn(mediator['mediatorMap'], 'register');

        mediator.onRegister();
        mediator.onRemove();

        // Verify the 'off' was called with the right parameters
        expect(signalOffSpy).toHaveBeenCalledWith(
            ModelSignals.SWITCH_TASK,
            expect.any(Function)
        );
        // Verify the side-effect (nothing happens when signal fires)
        (mediator as any).signalBus.emit(ModelSignals.SWITCH_TASK, TaskSignals.CARDS);
        expect(registerSpy).toHaveBeenCalledTimes(1);
    });

    it('should unregister the current view when switching to a new one', () => {
        const unregisterSpy = vi.spyOn(mediator['mediatorMap'], 'unregister');
        mediator.onRegister();

        // Grab a first argument from the first call (viewComponent.setView.mock.calls[0][0]) - MainMenuView
        const mainMenuInstance = vi.mocked(mockView.setView).mock.lastCall?.[0];
        mockView.activeView = mainMenuInstance;

        (mediator as any).signalBus.emit(ModelSignals.SWITCH_TASK, TaskSignals.CARDS);
        expect(unregisterSpy).toHaveBeenCalledWith(mainMenuInstance);
    });
});