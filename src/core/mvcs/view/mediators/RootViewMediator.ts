import { ModelSignals } from '../../../signal/type/ModelSignals';
import { TaskSignals } from '../../../signal/type/TaskSignals';
import { AbstractMediator } from '../AbstractMediator';
import { AbstractView } from '../AbstractView';
import { AceOfShadowsView } from '../components/AceOfShadowsView';
import { MagicWordsView } from '../components/MagicWordsView';
import { MainMenuView } from '../components/MainMenuView';
import { PhoenixFlameView } from '../components/PhoenixFlameView';
import { RootView } from '../components/RootView';

export class RootViewMediator extends AbstractMediator<RootView> {

    private static readonly TASK_MAP: Record<string, new () => AbstractView> = {
        [TaskSignals.MAIN]: MainMenuView,
        [TaskSignals.CARDS]: AceOfShadowsView,
        [TaskSignals.WORDS]: MagicWordsView,
        [TaskSignals.FLAME]: PhoenixFlameView
    };

    public override onRegister(): void {
        super.onRegister();

        console.debug("[RootViewMediator] Initializing Application Layers.");
        this.initMainMenu();
        this.signalBus.on(ModelSignals.SWITCH_TASK, this.onSwitchTask);
    }

    public override onRemove(): void {
        // INFO: Unnecessary but nice to follow convention,
        // the root is never removed, the application exits.
        this.signalBus.off(ModelSignals.SWITCH_TASK, this.onSwitchTask);
        super.onRemove();
    }

    private initMainMenu(): void {
        this.onSwitchTask(TaskSignals.MAIN);
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
        console.debug(`[RootViewMediator] Registering: ${view.constructor.name}`);
        const currentView = this.viewComponent.activeView;
        if (currentView) {
            this.mediatorMap.unregister(currentView);
        }
        this.mediatorMap.register(view);
        this.viewComponent.setView(view);

        view.init();
        view.emit(AbstractView.VIEW_READY_EVENT);
    }

    protected override get viewComponent(): RootView {
        return this.view;
    }
}