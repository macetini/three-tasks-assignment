import { ModelSignals } from "../../signal/ModelSignals";
import { TaskSignals } from "../../signal/TaskSignals";
import { AbstractMediator } from "./AbstractMediator";
import type { TaskView } from "./TaskView";

export class TaskMediator<T extends TaskView> extends AbstractMediator<T> {
    public static readonly BACK_CLICK_EVENT = 'backClickEvent';

    public override onRegister(): void {
        super.onRegister();
        this.view.on(TaskMediator.BACK_CLICK_EVENT, this.onBackClickEvent);
    }

    public override onRemove(): void {
        console.debug(`[${this.constructor.name}] Mediator removed.`);
        this.viewComponent.off(AbstractMediator.BACK_CLICK_EVENT, this.onBackClickEvent);
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