import { RootView } from '../component/RootView';
import { MainMenuView } from '../component/MainMenuView';
import { AbstractMediator } from '../AbstractMediator';
import { AceOfShadowsView } from '../component/AceOfShadowsView';
import type { AbstractView } from '../AbstractView';
import type { Container } from 'pixi.js';
import { SignalType } from '../../../signal/type/SignalType';
import type { AssetService } from '../../service/AssetService';
import { TaskType } from '../../../signal/type/TaskType';

export class RootViewMediator extends AbstractMediator<RootView> {

    private static readonly TASK_MAP: Record<string, new () => AbstractView> = {
        [TaskType.CARDS]: AceOfShadowsView,
        // [TaskType.FIRE]: MagicFireView,
    };

    constructor(view: RootView) {
        super(view);
    }

    public override onRegister(): void {
        super.onRegister();

        console.log("[RootViewMediator] Initializing Application Layers.");
        // 1. Setup the Permanent UI (Menu)
        this.initMenu();
        this.signalBus.on(SignalType.SWITCH_TASK, this.onSwitchTask);
    }

    public override onRemove(): void {
        // INFO: Unnecessary but nice to follow convention,
        // the root is never removed, the application exits.
        this.signalBus.off(SignalType.SWITCH_TASK, this.onSwitchTask);
        super.onRemove();
    }

    private initMenu(): void {
        this.addAndRegister(new MainMenuView(), this.view.uiLayer);
    }

    private addAndRegister<T extends AbstractView>(view: T, layer: Container): void {
        console.log(`[RootViewMediator] Registering: ${view.constructor.name}`);
        layer.addChild(view);
        this.mediatorMap.register(view);
        view.init();
    }

    private readonly onSwitchTask = (taskType: string): void => {
        console.log(`[RootViewMediator] Executing switch to: ${taskType}`);

        const ViewClass = RootViewMediator.TASK_MAP[taskType];

        const currentTaskView = this.viewComponent.activeTask;
        if (currentTaskView) {
            this.mediatorMap.unregister(currentTaskView);
        }

        this.showTask(ViewClass);
    }

    private showTask(ViewClass: new (...args: any[]) => AbstractView): void {
        // Instantiate with the service required by the View
        const viewInstance = new ViewClass(this.assetService);

        // RootView handles taskLayer cleanup and adding the new view
        this.viewComponent.setTaskView(viewInstance);

        // MediatorMap registers and calls onRegister()
        this.mediatorMap.register(viewInstance);

        // Manual init for internal view setup
        viewInstance.init();
    }

    protected override get viewComponent(): RootView {
        return this.view;
    }
}