// src/core/mvcs/view/MainView.ts
import { Container } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class RootView extends AbstractView {
    // We create dedicated layers for depth management
    private backgroundLayer: Container = new Container();

    private taskLayer: Container = new Container();

    private readonly _uiLayer: Container = new Container();
    public get uiLayer(): Container {
        return this._uiLayer;
    }

    public override init(): void {
        this.addChild(this.backgroundLayer);
        this.addChild(this.taskLayer);
        this.addChild(this._uiLayer);
    }

    public get activeTask(): AbstractView | undefined {
        return this.taskLayer.children[0] as AbstractView;
    }

    public setTaskView(view: AbstractView): void {
        if (this.taskLayer.children.length > 0) {
            const oldView = this.taskLayer.children[0] as AbstractView;
            if (oldView.dispose) oldView.dispose();
            this.taskLayer.removeChildren();
        }

        this.taskLayer.addChild(view);
        view.init();
    }
}