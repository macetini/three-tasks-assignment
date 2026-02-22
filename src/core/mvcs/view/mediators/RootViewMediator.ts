// src/core/mvcs/view/mediator/RootViewMediator.ts
import { ModelSignals } from '../../../signal/ModelSignals';
import { TaskSignals } from '../../../signal/TaskSignals';
import { AbstractMediator } from '../AbstractMediator';
import { AbstractView } from '../AbstractView';
import { AceOfShadowsView } from '../components/AceOfShadowsView';
import { MagicWordsView } from '../components/MagicWordsView';
import { MainMenuView } from '../components/MainMenuView';
import { PhoenixFlameView } from '../components/PhoenixFlameView';
import { RootView } from '../components/RootView';

/**
 * The RootViewMediator acts as the primary Navigator for the application.
 * It manages the top-level view stack, handling the transition between 
 * different tasks and ensuring proper Mediator registration/unregistration.
 */
export class RootViewMediator extends AbstractMediator<RootView> {

    /**
     * Map of task identifiers to their respective View constructors.
     * This allows for scalable navigation without nested switch statements.
     */
    private static readonly TASK_MAP: Record<string, new () => AbstractView> = {
        [TaskSignals.MAIN]: MainMenuView,
        [TaskSignals.CARDS]: AceOfShadowsView,
        [TaskSignals.WORDS]: MagicWordsView,
        [TaskSignals.FLAME]: PhoenixFlameView
    };

    /**
     * Called after the mediator is registered.
     * Sets up the event listener for the ModelSignals.SWITCH_TASK signal and
     * initializes the main menu view by triggering a task switch event
     * with the MAIN task type.
     */
    public override onRegister(): void {
        super.onRegister();

        console.debug("[RootViewMediator] Initializing Application Layers.");
        this.initMainMenu();
        this.signalBus.on(ModelSignals.SWITCH_TASK, this.onSwitchTask);
    }

    /**
     * Called when the view is removed from the stage.
     * Removes the event listener for the ModelSignals.SWITCH_TASK signal.
     * Calls the parent's onRemove() method to complete the cleanup process.
     */
    public override onRemove(): void {
        this.signalBus.off(ModelSignals.SWITCH_TASK, this.onSwitchTask);
        super.onRemove();
    }

    /**
     * Initializes the main menu view by triggering a task switch event
     * with the MAIN task type.
     * This method is called once during the mediator's onRegister() lifecycle.
     */
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

    /**
     * Adds a new view to the stage and registers it with the MediatorMap.
     * Unregisters and disposes any existing view.
     * Sets the new view as the active view and initializes it.
     * Emits the AbstractView.VIEW_ADDED_TO_ROOT_EVENT event to notify the view.
     * 
     * @template T The type of the view to be added.
     * @param view The view instance to be added.
     */
    private addAndRegister<T extends AbstractView>(view: T): void {
        console.debug(`[RootViewMediator] Registering: ${view.constructor.name}`);
        const currentView = this.viewComponent.activeView;
        if (currentView) {
            this.mediatorMap.unregister(currentView);
        }
        this.mediatorMap.register(view);
        this.viewComponent.setView(view);
        view.init();
        
        // Called outside of mediator to avoid accidentally overriding the event
        view.emit(AbstractView.VIEW_ADDED_TO_ROOT_EVENT);
    }

    /**
     * Returns the RootView component.
     * Can be cast to the specific RootView type.
     * 
     * @returns {RootView} The view component.
     */
    protected override get viewComponent(): RootView {
        return this.view;
    }
}