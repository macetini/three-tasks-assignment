import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AbstractView } from '../../../../src/core/mvcs/view/AbstractView';

// Concrete implementation for testing purposes
class TestView extends AbstractView { }

describe('AbstractView', () => {
    let view: TestView;

    beforeEach(() => {
        view = new TestView();
        vi.clearAllMocks();
    });

    it('should initialize without crashing', () => {
        expect(() => view.init()).not.toThrow();
    });

    it('should log a warning if layout is called with invalid dimensions', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        view.layout(0, 600);

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Skipping layout update')
        );

        warnSpy.mockRestore();
    });

    it('should properly dispose and destroy itself with specific flags', () => {
        view.dispose();
        expect(view.destroy).toHaveBeenCalledWith({
            children: true,
            texture: false
        });
    });

    it('should expose the static event string for the mediator to use', () => {
        expect(AbstractView.VIEW_ADDED_TO_ROOT_EVENT).toBe('viewAddedToRootEvent');
    });
});