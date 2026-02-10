import { SignalType } from '../../../signal/type/SignalType';
import { TaskType } from '../../../signal/type/TaskType';
import { AbstractMediator } from '../AbstractMediator';
import type { AbstractView } from '../AbstractView';
import { AceOfShadowsView } from '../component/AceOfShadowsView';
import { MainMenuView } from '../component/MainMenuView';
import { RootView } from '../component/RootView';

export class RootViewMediator extends AbstractMediator<RootView> {

    private static readonly TASK_MAP: Record<string, new () => AbstractView> = {
        [TaskType.MAIN]: MainMenuView,
        [TaskType.CARDS]: AceOfShadowsView,
        // [TaskType.FIRE]: MagicFireView,
    };

    public override onRegister(): void {
        super.onRegister();

        console.log("[RootViewMediator] Initializing Application Layers.");
        this.initMainMenu();
        this.signalBus.on(SignalType.SWITCH_TASK, this.onSwitchTask);
    }

    public override onRemove(): void {
        // INFO: Unnecessary but nice to follow convention,
        // the root is never removed, the application exits.
        this.signalBus.off(SignalType.SWITCH_TASK, this.onSwitchTask);
        super.onRemove();
    }

    private initMainMenu(): void {
        this.onSwitchTask(TaskType.MAIN);
    }

    private readonly onSwitchTask = (taskType: string): void => {
        const ViewClass = RootViewMediator.TASK_MAP[taskType];
        if (!ViewClass) {
            console.warn(`[RootViewMediator] Unknown Task Type: ${taskType}`);
            return;
        }
        const nextView = new ViewClass();
        this.addAndRegister(nextView);
    }

    private addAndRegister<T extends AbstractView>(view: T): void {
        console.log(`[RootViewMediator] Registering: ${view.constructor.name}`);
        const currentView = this.viewComponent.activeView;
        if (currentView) {
            this.mediatorMap.unregister(currentView);
        }
        this.viewComponent.setView(view);
        this.mediatorMap.register(view);
        view.init();
    }

    protected override get viewComponent(): RootView {
        return this.view;
    }
}