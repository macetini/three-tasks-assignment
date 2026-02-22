// src/core/mvcs/view/components/RootView.ts
import { AbstractView } from '../AbstractView';

/**
 * The top-level container for the application.
 * Manages the switching of main task views (Cards, Chat, Flame).
 */
export class RootView extends AbstractView {

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

    protected cleanup(): void {
        this._activeView?.dispose();
        this._activeView?.destroy({ children: true });
    }

    protected addViewToRoot(newView: AbstractView): void {
        this._activeView = newView;
        this.addChild(this._activeView);
    }
}