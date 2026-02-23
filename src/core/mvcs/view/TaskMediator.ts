// src/core/mvcs/view/TaskMediator.ts
import { ModelSignals } from "../../signal/ModelSignals";
import { TaskSignals } from "../../signal/TaskSignals";
import { AbstractMediator } from "./AbstractMediator";
import type { TaskView } from "./TaskView";

/**
 * The TaskMediator class extends the AbstractMediator class and provides
 * additional functionality for task views.
 * It handles the back click event by emitting the ModelSignals.SWITCH_TASK signal
 * with the TaskSignals.MAIN payload.
 * 
 * @template T - The type of the TaskView component.
 * @extends {AbstractMediator<T>}
 * @class TaskMediator
 * 
 */
export class TaskMediator<T extends TaskView> extends AbstractMediator<T> {
    public static readonly BACK_CLICK_EVENT = 'backClickEvent';

    /**
     * Initializes the event listener for the TaskMediator.BACK_CLICK_EVENT event.
     * When the event is triggered, it calls the onBackClickEvent method to
     * emit the ModelSignals.SWITCH_TASK signal, which triggers a task switch
     * in the application.
     * This method is called once during the mediator's onRegister() lifecycle.
     */
    protected override initListener(): void {
        super.initListener();
        this.view.on(TaskMediator.BACK_CLICK_EVENT, this.onBackClickEvent);
    }

    /**
     * Cleans up the TaskMediator by removing the event listener for the back click event.
     * This method is called when the mediator is no longer needed.
     */
    protected override cleanUp(): void {
        super.cleanUp();
        this.view.off(TaskMediator.BACK_CLICK_EVENT, this.onBackClickEvent);
    }

    /**
    * Handles the back click event by emitting the ModelSignals.SWITCH_TASK signal
    * with the TaskSignals.MAIN payload.
    */
    private readonly onBackClickEvent = (): void => {
        console.debug(`[${this.constructor.name}] Handling: `, TaskMediator.BACK_CLICK_EVENT);
        this.signalBus.emit(ModelSignals.SWITCH_TASK, TaskSignals.MAIN);
    }


}