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
});