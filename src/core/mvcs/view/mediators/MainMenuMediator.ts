// src/core/mvcs/view/mediator/MainMenuMediator.ts
import { ModelSignals } from '../../../signal/ModelSignals';
import { AbstractMediator } from '../AbstractMediator';
import { MainMenuView } from '../components/MainMenuView';

export class MainMenuMediator extends AbstractMediator<MainMenuView> {
    public override onRegister(): void {
        super.onRegister();
        this.viewComponent.on(MainMenuView.MENU_CLICK_EVENT, this.onMenuClick);
    }

    public override onRemove(): void {
        this.viewComponent.off(MainMenuView.MENU_CLICK_EVENT, this.onMenuClick);
        super.onRemove();
    }

    protected override isValidLayout(width: number, height: number): boolean {
        if (width < 0 || height < 0) {
            console.warn('[MainMenuMediator] Suppressing impossible dimensions.');
            return false;
        }
        
        // Sanity check: CSS aspect-ratio ensures width < height for portrait
        // If height is impossible, skip this update to prevent jumping
        // I had some issues with this in the past
        if (height > window.innerHeight * 1.5) {
            console.warn('[MainMenuMediator] Suppressing impossible height.');
            return false;
        }
        return true;
    }

    private readonly onMenuClick = (taskType: string): void => {
        console.debug('[MainMenuMediator] Click on the Menu Button Type: ', taskType);
        this.signalBus.emit(ModelSignals.SWITCH_TASK, taskType);
    }
}