// src/core/mvcs/view/components/RootView.ts
import { AbstractView } from '../AbstractView';

/**
 * The top-level container for the application.
 * Manages the switching of main task views (Cards, Chat, Flame).
 */
export class RootView extends AbstractView {

    /**
     * Returns the currently displayed task view.
     */
    public get activeView(): AbstractView | undefined {
        return this.children[0] as AbstractView;
    }

    /**
     * 
     * The RootView serves as the main stage container and does not require 
     * navigation elements of its own.
     * 
     * * @override
     */
    protected override createBackButton(): void {
        // Intentional no-op: Root level has no "Back" destination.
    }

    /**
     * Completely replaces the current view with a new one.
     * Handles the cleanup of the previous view to prevent memory leaks.
     * 
     * @param view - The new AbstractView to be displayed.
     */
    public setView(view: AbstractView): void {
        if (this.children.length > 0) {
            const oldView = this.children[0] as AbstractView;

            console.debug(`[RootView] Transition: Removing ${oldView.constructor.name} -> Adding ${view.constructor.name}`);
            
            if (oldView.dispose) {
                oldView.dispose();
            }
            oldView.destroy({ children: true });
            this.removeChildren();
        }
        this.addChild(view);
    }
}