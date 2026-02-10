// src/core/mvcs/view/MainView.ts
import { AbstractView } from '../AbstractView';

export class RootView extends AbstractView {

    public get activeView(): AbstractView | undefined {
        return this.children[0] as AbstractView;
    }

    /**
     * Completely replaces the current view with a new one
     */
    public setView(view: AbstractView): void {
        if (this.children.length > 0) {
            const oldView = this.children[0] as AbstractView;
            console.log(`[RootView] Replacing ${oldView.constructor.name} with ${view.constructor.name}`);
            if (oldView.dispose) oldView.dispose();
            this.removeChildren();
        }
        this.addChild(view);        
    }
}