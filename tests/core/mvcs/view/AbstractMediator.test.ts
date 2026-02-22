import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AbstractMediator } from '../../../../src/core/mvcs/view/AbstractMediator';
import { AbstractView } from '../../../../src/core/mvcs/view/AbstractView';

class TestMediator extends AbstractMediator<AbstractView> {
    public get viewRef() { return this.view; }
}

describe('AbstractMediator', () => {
    let testMediator: TestMediator;
    let mockView: any;
    let mockApp: any;

    beforeEach(() => {
        mockView = {
            once: vi.fn(),
            onAddedToRoot: vi.fn(),
            layout: vi.fn(),
        };

        mockApp = {
            renderer: {
                on: vi.fn(),
                off: vi.fn(),
            },
            screen: { width: 800, height: 600 }
        };

        testMediator = new TestMediator(mockView);
        testMediator.setApp(mockApp);
    });

    it('assigns the view', () => {
        const mediator = new TestMediator(mockView);
        expect(mediator.viewRef).toBe(mockView);
    });

    it('should register a resize listener on the renderer during onRegister', () => {
        testMediator.onRegister();
        expect(mockApp.renderer.on).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should clean up the resize listener on the renderer during onRemove', () => {
        testMediator.onRegister();
        testMediator.onRemove();
        expect(mockApp.renderer.off).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should trigger layout when the view is added to root', () => {
        testMediator.onRegister();

        const eventName = AbstractView.VIEW_ADDED_TO_ROOT_EVENT;
        const callback = mockView.once.mock.calls.find((call: any[]) => call[0] === eventName)[1];

        callback();

        expect(mockView.layout).toHaveBeenCalledWith(800, 600);
        expect(mockView.onAddedToRoot).toHaveBeenCalled();
    });

    it('should skip layout if the screen width or height is 0 (Guard Check)', () => {
        mockApp.screen.width = 0;
        mockApp.screen.height = 0;
        testMediator.onRegister();

        (testMediator as any).triggerLayout();
        expect(mockView.layout).not.toHaveBeenCalled();
    });

    it('should correctly validate valid and invalid layouts', () => {
        expect((testMediator as any).isLayoutValid(10, 10)).toBe(true);
        expect((testMediator as any).isLayoutValid(0, 500)).toBe(false);
        expect((testMediator as any).isLayoutValid(-10, -10)).toBe(false);
    });
});