// src/core/mvcs/view/mediator/MainMenuMediator.ts
import { AbstractMediator } from '../AbstractMediator';
import { MainMenuView } from '../component/MainMenuView';

export class MainMenuMediator extends AbstractMediator<MainMenuView> {

    protected override viewComponent(): MainMenuView {
        return this.view;
    }

    public override onRegister(): void {
        requestAnimationFrame(() => this.applyLayout());
        this.app.renderer.on('resize', this.onResize);
    }

    private readonly onResize = (): void => {
        this.applyLayout();
    };

    private applyLayout(): void {
        const { width, height } = this.app.screen;

        // Sanity check: CSS aspect-ratio ensures width < height for portrait
        // If height is impossible, skip this update to prevent jumping
        // I had some issues with this in the past
        if (height > window.innerHeight * 1.5) {
            console.error('[MainMenuMediator] Skipping layout update due to impossible height');
            return;
        }

        console
        this.view.layout(width, height);
    }

    public override onRemove(): void {
        this.app.renderer.off('resize', this.onResize);
        super.onRemove();
    }
}