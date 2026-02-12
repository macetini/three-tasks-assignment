// src/core/mvcs/view/mediator/MainMenuMediator.ts
import { ModelSignals } from '../../../signal/ModelSignals';
import { AbstractMediator } from '../AbstractMediator';
import { MainMenuView } from '../components/MainMenuView';

/**
 * Mediator responsible for the primary navigation interface.
 * Captures user input from the MainMenuView and translates it into application signals.
 */
export class MainMenuMediator extends AbstractMediator<MainMenuView> {
    public override onRegister(): void {
        super.onRegister();
        this.viewComponent.on(MainMenuView.MENU_CLICK_EVENT, this.onMenuClick);
    }

    /**
     * Removes the event listener for the MainMenuView.MENU_CLICK_EVENT event.
     * Also calls the parent's onRemove() method to ensure proper cleanup.
     */
    public override onRemove(): void {
        this.viewComponent.off(MainMenuView.MENU_CLICK_EVENT, this.onMenuClick);
        super.onRemove();
    }

    /**
     * Architectural Guard: Validation logic for the layout lifecycle.
     * Prevents UI "flickering" or "jumping" by filtering out anomalous 
     * browser dimension reports during rapid resizing or orientation changes.
     * 
     * @param width - The target layout width.
     * @param height - The target layout height.
     * @returns True if dimensions are within a realistic range.
     */
    protected override isValidLayout(width: number, height: number): boolean {
        if (width < 0 || height < 0) {
            console.warn('[MainMenuMediator] Suppressing impossible dimensions.');
            return false;
        }

        /**
         * Browser Mitigation: On some mobile browsers, window.innerHeight can 
         * report inconsistent values during the transition of the address bar.
         * We suppress any updates exceeding a 1.5x sanity threshold.
         */
        if (height > window.innerHeight * 1.5) {
            console.warn('[MainMenuMediator] Suppressing impossible height.');
            return false;
        }
        return true;
    }

    /**
     * Event Handler: MENU_CLICK_EVENT
     * Forwards the selected task type to the SignalBus to trigger state transitions.
     * 
     * @param taskType - The string identifier of the selected task.
     */
    private readonly onMenuClick = (taskType: string): void => {
        console.debug('[MainMenuMediator] Click on the Menu Button Type: ', taskType);
        this.signalBus.emit(ModelSignals.SWITCH_TASK, taskType);
    }
}