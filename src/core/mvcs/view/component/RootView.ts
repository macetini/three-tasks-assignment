// src/core/mvcs/view/MainView.ts
import { Container } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class RootView extends AbstractView {
    // We create dedicated layers for depth management
    private _backgroundLayer: Container = new Container();
    private _taskLayer: Container = new Container();

    private readonly _uiLayer: Container = new Container();
    public get uiLayer(): Container {
        return this._uiLayer;
    }

    public override init(): void {
        this.addChild(this._backgroundLayer);
        this.addChild(this._taskLayer);
        this.addChild(this._uiLayer);
    }

    public addUI(view: AbstractView): void {
        this._uiLayer.addChild(view);
        view.init();
    }

    public setTaskView(view: AbstractView): void {
        if (this._taskLayer.children.length > 0) {
            const oldView = this._taskLayer.children[0] as AbstractView;
            if (oldView.dispose) oldView.dispose();
            this._taskLayer.removeChildren();
        }

        this._taskLayer.addChild(view);
        view.init();
    }
}