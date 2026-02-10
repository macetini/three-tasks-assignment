// src/core/mvcs/view/MainView.ts
import { Container } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class RootView extends AbstractView {
    // We create dedicated layers for depth management
    private backgroundLayer: Container = new Container();
    private taskLayer: Container = new Container();
    private uiLayer: Container = new Container();

    public override init(): void {
        this.addChild(this.backgroundLayer);
        this.addChild(this.taskLayer);
        this.addChild(this.uiLayer);
    }

    public addUI(view: AbstractView): void {
        this.uiLayer.addChild(view);
        view.init();
    }

    /**
     * The MainMediator calls this to swap Task 1, 2, or 3.
     */
    public setTaskView(view: AbstractView): void {
        // 1. Clean up the previous view properly [RobotLegs style]
        if (this.taskLayer.children.length > 0) {
            const oldView = this.taskLayer.children[0] as AbstractView;
            if (oldView.dispose) oldView.dispose();
            this.taskLayer.removeChildren();
        }

        // 2. Add the new view to the dedicated task layer
        this.taskLayer.addChild(view);
        view.init();
    }
}