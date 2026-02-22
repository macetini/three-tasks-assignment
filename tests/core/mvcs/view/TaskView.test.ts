// tests/core/mvcs/view/TaskView.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AbstractMediator } from '../../../../src/core/mvcs/view/AbstractMediator';
import { TaskView } from '../../../../src/core/mvcs/view/TaskView';

class TestTaskView extends TaskView { }

describe('TaskView', () => {
    let view: TestTaskView;

    beforeEach(() => {
        view = new TestTaskView();
        vi.clearAllMocks();
    });

    it('should add a back button child during init', () => {
        view.init();
        expect(view.addChild).toHaveBeenCalled();
    });

    it('should emit BACK_CLICK_EVENT when the Escape key is pressed', () => {
        const emitSpy = vi.spyOn(view, 'emit');
        view.init();

        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        globalThis.dispatchEvent(event);

        expect(emitSpy).toHaveBeenCalledWith(AbstractMediator.BACK_CLICK_EVENT);
    });

    it('should NOT emit BACK_CLICK_EVENT if a key other than Escape is pressed', () => {
        const emitSpy = vi.spyOn(view, 'emit');
        view.init();

        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        globalThis.dispatchEvent(event);

        expect(emitSpy).not.toHaveBeenCalledWith(AbstractMediator.BACK_CLICK_EVENT);
    });

    it('should remove the global keyboard listener upon disposal', () => {
        const removeEventListenerSpy = vi.spyOn(globalThis, 'removeEventListener');
        const emitSpy = vi.spyOn(view, 'emit');

        view.init();
        view.dispose();
        
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        globalThis.dispatchEvent(event);

        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(emitSpy).not.toHaveBeenCalled();
    });
});