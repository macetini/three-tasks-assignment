import { RootView } from '../component/RootView';
import { MainMenuView } from '../component/MainMenuView';
import { AbstractMediator } from '../AbstractMediator';
import { AceOfShadowsView } from '../component/AceOfShadowsView';
import type { AbstractView } from '../AbstractView';
import type { Container } from 'pixi.js';

export class RootViewMediator extends AbstractMediator<RootView> {
    private _activeTaskMediator: AbstractMediator<any> | null = null;

    constructor(view: RootView) {
        super(view);
    }

    public override onRegister(): void {
        super.onRegister();
        console.log("[RootViewMediator] Initializing Application Layers.");

        // 1. Setup the Permanent UI (Menu)
        this.initMenu();

        // 2. Listen for the Global Task Switch event
        // Use a bound function so we can remove it later
        window.addEventListener('SWITCH_TASK', this.handleSwitchTask);

        // 3. Load default
        this.onSwitchTask('CARDS');
    }

    private initMenu(): void {
        this.addAndRegister(new MainMenuView(), this.view.uiLayer);
    }

    private addAndRegister<T extends AbstractView>(view: T, layer: Container): void {
        layer.addChild(view);
        this.mediatorMap.register(view);
        view.init();
    }

    // Helper to handle the event listener context
    private readonly handleSwitchTask = (e: any): void => {
        this.onSwitchTask(e.detail);
    };

    private onSwitchTask(taskType: string): void {
        // 1. Teardown existing mediator
        if (this._activeTaskMediator) {
            this._activeTaskMediator.onRemove();
            this._activeTaskMediator = null;
        }

        // 2. Switch Task
        /*
        if (taskType === 'CARDS') {
            this.showTask(AceOfShadowsView);
        } else if (taskType === 'FIRE') {
            // this.showTask(MagicFireView);
        }*/
    }

    private showTask(ViewClass: new (...args: any[]) => AbstractView): void {
        // Instantiate the View
        const viewInstance = new ViewClass();

        // RootView handles adding to taskLayer and removing old children
        this.view.setTaskView(viewInstance);

        // Register couples them and calls onRegister() automatically
        this._activeTaskMediator = this.mediatorMap.register(viewInstance);
    }

    public override onRemove(): void {
        window.removeEventListener('SWITCH_TASK', this.handleSwitchTask);

        if (this._activeTaskMediator) {
            this._activeTaskMediator.onRemove();
        }

        super.onRemove();
    }
}