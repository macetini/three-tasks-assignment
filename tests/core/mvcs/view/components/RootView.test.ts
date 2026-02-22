// test/core/mvcs/view/components/RootView.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AbstractView } from '../../../../../src/core/mvcs/view/AbstractView';
import { RootView } from '../../../../../src/core/mvcs/view/components/RootView';

// Create a concrete mock view to test the transitions
class MockTaskView extends AbstractView {
    public init = vi.fn();
    public onAddedToRoot = vi.fn();
    public layout = vi.fn();
}

describe('RootView', () => {
    let rootView: RootView;

    beforeEach(() => {
        rootView = new RootView();
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('should have an undefined activeView by default', () => {
            expect(rootView.activeView).toBeUndefined();
        });
    });

    describe('setView Logic', () => {
        it('should correctly set the activeView and add it to the display list', () => {
            const newView = new MockTaskView();

            rootView.setView(newView);

            expect(rootView.activeView).toBe(newView);
            expect(rootView.addChild).toHaveBeenCalledWith(newView);
        });

        it('should clean up and destroy the previous view when a new one is set', () => {
            const firstView = new MockTaskView();
            const secondView = new MockTaskView();

            rootView.setView(firstView);
            expect(rootView.activeView).toBe(firstView);

            rootView.setView(secondView);
            expect(firstView.destroy).toHaveBeenCalledWith({ children: true });

            expect(rootView.activeView).toBe(secondView);
            expect(rootView.addChild).toHaveBeenCalledWith(secondView);
        });
    });

    describe('Protected Method Access', () => {
        it('should allow overriding addViewToRoot for custom transitions', () => {
            // This test ensures the architectural split we made is functional
            class TransitionRootView extends RootView {
                public transitionCalled = false;
                protected override addViewToRoot(view: AbstractView): void {
                    super.addViewToRoot(view);
                    this.transitionCalled = true;
                }
            }

            const customRoot = new TransitionRootView();
            customRoot.setView(new MockTaskView());
            expect(customRoot.transitionCalled).toBe(true);
        });
    });
});