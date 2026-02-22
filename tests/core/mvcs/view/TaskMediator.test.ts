// tests/core/mvcs/view/TaskMediator.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskMediator } from '../../../../src/core/mvcs/view/TaskMediator';
import { ModelSignals } from '../../../../src/core/signal/ModelSignals';
import { TaskSignals } from '../../../../src/core/signal/TaskSignals';

class TestTaskMediator extends TaskMediator<any> { }

describe('TaskMediator', () => {
    let mediator: TestTaskMediator;
    let mockView: any;
    let mockSignalBus: any;

    beforeEach(() => {
        mockView = {
            on: vi.fn(),
            off: vi.fn(),
            once: vi.fn(),
            onAddedToRoot: vi.fn(),
            layout: vi.fn(),
        };

        mockSignalBus = {
            emit: vi.fn()
        };

        mediator = new TestTaskMediator(mockView);
        mediator.setSignalBus(mockSignalBus);

        mediator.setApp({
            renderer: {
                on: vi.fn(),
                off: vi.fn()
            }
        } as any);
    });

    it('should register a listener for the back click event onRegister', () => {
        mediator.onRegister();

        expect(mockView.on).toHaveBeenCalledWith(
            TaskMediator.BACK_CLICK_EVENT,
            expect.any(Function)
        );
    });

    it('should emit a SWITCH_TASK signal to MAIN when back is clicked', () => {
        mediator.onRegister();
                
        const backClickHandler = vi.mocked(mockView.on).mock.calls.find(
            (call: any[]) => call[0] === TaskMediator.BACK_CLICK_EVENT
        )![1];

        backClickHandler();

        expect(mockSignalBus.emit).toHaveBeenCalledWith(
            ModelSignals.SWITCH_TASK,
            TaskSignals.MAIN
        );
    });

    it('should clean up the back click listener onRemove', () => {
        mediator.onRegister();
        mediator.onRemove();

        expect(mockView.off).toHaveBeenCalledWith(
            TaskMediator.BACK_CLICK_EVENT,
            expect.any(Function)
        );
    });
});