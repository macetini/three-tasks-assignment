import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { RootView } from '../src/core/mvcs/view/components/RootView';
import { Container } from 'pixi.js';

describe('RootView', () => {
    let rootView: RootView;

    beforeEach(() => {
        rootView = new RootView() as any;
    });

    test('activeView should return undefined when no view is set', () => {
        expect(rootView.activeView).toBeUndefined();
    });

    test('setView should add the new view to children', () => {
        const mockView = new Container() as any;
        rootView.setView(mockView);

        expect(rootView.children.length).toBe(1);
        expect(rootView.activeView).toBe(mockView);
    });

    test('setView should dispose and destroy the previous view', () => {
        // Create an old view with a dispose spy
        const oldView = new Container() as any;
        oldView.dispose = jest.fn();
        oldView.destroy = jest.fn();
        // Add it to the root
        rootView.addChild(oldView);
        // Create a new view
        const newView = new Container() as any;
        // Trigger the switch
        rootView.setView(newView);
        // Verify Cleanup
        expect(oldView.dispose).toHaveBeenCalled();
        expect(oldView.destroy).toHaveBeenCalledWith({ children: true });
        // Verify Transition
        expect(rootView.children).not.toContain(oldView);
        expect(rootView.activeView).toBe(newView);
    });

    test('setView should handle old views that do not have a dispose method', () => {
        const oldViewNoDispose = new Container() as any;
        oldViewNoDispose.destroy = jest.fn();

        rootView.addChild(oldViewNoDispose);

        const newView = new Container() as any;

        // This should not throw an error
        expect(() => rootView.setView(newView)).not.toThrow();
        expect(oldViewNoDispose.destroy).toHaveBeenCalled();
    });
});