// src/core/mvcs/view/components/RootView.ts
import { AbstractView } from '../AbstractView';

/**
 * The top-level container for the application.
 * Manages the switching of main task views (Cards, Chat, Flame).
 */
export class RootView extends AbstractView {

    /** The currently active task view. */
    private _activeView?: AbstractView;

    /**
     * Returns the currently displayed task view.
     */
    public get activeView(): AbstractView | undefined {
        return this._activeView;
    }

    /**
     * Completely replaces the current view with a new one.
     * Handles the cleanup of the previous view to prevent memory leaks.
     * 
     * @param view - The new AbstractView to be displayed.
     */
    public setView(view: AbstractView): void {
        this.cleanup();
        this.addViewToRoot(view);
    }

    /**
     * Cleans up the current active view by calling its dispose method
     * and then destroying it with children set to true. This method
     * is called when setView() is called to ensure that the previous
     * view is properly cleaned up to prevent memory leaks.
     */
    protected cleanup(): void {
        this._activeView?.dispose();
        this._activeView?.destroy({ children: true });
    }

    /**
     * Adds a new view to the stage and sets it as the active view.
     * Use this method instead of setView() when you want to preserve the previous view.
     * This method will not dispose or destroy the previous view.
     * 
     * @param newView - The new AbstractView to be displayed.
     */
    protected addViewToRoot(newView: AbstractView): void {
        this._activeView = newView;
        this.addChild(this._activeView);
    }
}