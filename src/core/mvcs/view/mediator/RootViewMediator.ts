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
        this.addAndRegister(new MainMenuView());
    }

    private addAndRegister<T extends AbstractView>(view: T): void {
        console.log(`[RootViewMediator] Registering: ${view.constructor.name}`);
        this.viewComponent.setView(view);
        this.mediatorMap.register(view);
        view.init();
    }

    private readonly onSwitchTask = (taskType: string): void => {
        // Find the new class from our map
        const ViewClass = RootViewMediator.TASK_MAP[taskType];
        if (!ViewClass) {
            return;
        }

        // Unregister the mediator of the view currently on screen
        const currentView = this.viewComponent.activeView;
        if (currentView) {
            this.mediatorMap.unregister(currentView);
        }
        // Instantiate and swap
        const nextView = new ViewClass();
        // RootView removes old child and adds new one
        this.viewComponent.setView(nextView);
        // Register new mediator
        this.mediatorMap.register(nextView);
        // Initialize view logic
        nextView.init();
    };

    protected override get viewComponent(): RootView {
        return this.view;
    }
}