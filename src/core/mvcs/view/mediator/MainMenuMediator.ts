// src/core/mvcs/view/mediator/MainMenuMediator.ts
import { SignalType } from '../../../signal/type/SignalType';
import { AbstractMediator } from '../AbstractMediator';
import { MainMenuView } from '../component/MainMenuView';

export class MainMenuMediator extends AbstractMediator<MainMenuView> {

    public override onRegister(): void {
        super.onRegister();

        requestAnimationFrame(() => this.applyLayout());

        this.app.renderer.on('resize', this.onResize);
        this.viewComponent.on(MainMenuView.MENU_CLICK_EVENT, this.onMenuClick);
    }

    public override onRemove(): void {
        this.viewComponent.off(MainMenuView.MENU_CLICK_EVENT, this.onMenuClick);
        this.app.renderer.off('resize', this.onResize);

        super.onRemove();
    }

    private readonly onResize = (): void => {
        this.applyLayout();
    }

    private readonly onMenuClick = (taskType: string): void => {
        console.log('[MainMenuMediator] Click on the Menu Button Type: ', taskType);
        this.signalBus.emit(SignalType.SWITCH_TASK, taskType);
    }

    private applyLayout(): void {
        const { width, height } = this.app.screen;

        // Sanity check: CSS aspect-ratio ensures width < height for portrait
        // If height is impossible, skip this update to prevent jumping
        // I had some issues with this in the past
        if (height > window.innerHeight * 1.5) {
            console.error('[MainMenuMediator] Skipping layout update due to impossible height');
            return;
        }

        console.log('[MainMenuMediator] Layout update: ', width, height);
        this.view.layout(width, height);
    }

    protected override get viewComponent(): MainMenuView {
        return this.view;
    }
}