// src/core/mvcs/views/AbstractView.ts
import { Container, Text } from 'pixi.js';
import { GameConfig } from '../../config/GameConfig';
import { AbstractMediator } from './AbstractMediator';

export abstract class AbstractView extends Container {
    /**
     * Called by the Mediator or Parent during the setup phase.
     * Use this to create children, setup layout, etc.
     */
    public init(): void {
        console.debug(`[${this.constructor.name}] View initialized.`);
        this.createBackButton();
    };

    /**
     * Creates the default back button that every view except the root one will have.
     * 
     * NOTE: This is not the best way to do it, but for a prototype it will do the job.
     */
    protected createBackButton(): void {
        console.debug(`[${this.constructor.name}] Adding default back button.`);
        const backBtn = new Text({
            text: GameConfig.GLOBAL.BACK_BUTTON_GRAPHIC,
            style: { fill: 0xffffff, fontSize: 36 }
        });

        backBtn.interactive = true;
        backBtn.cursor = 'pointer';
        backBtn.position.set(GameConfig.GLOBAL.BACK_BUTTON_X, GameConfig.GLOBAL.BACK_BUTTON_Y);

        backBtn.on('pointertap', () => this.emit(AbstractMediator.BACK_CLICK_EVENT));

        globalThis.addEventListener('keydown', this.onEscapeKeyDown);

        this.addChild(backBtn);
    }

    private readonly onEscapeKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            this.emit(AbstractMediator.BACK_CLICK_EVENT);
        }
    }

    /**
     * 
     * Called by the Mediator or Parent during the render phase.
     * 
     * @param width Width of the screen
     * @param height Height of the screen
     */
    public layout(width: number, height: number): void {
        if (width <= 0 || height <= 0) {
            console.warn(`[${this.constructor.name}] Skipping layout update due to collapsed renderer.`);
            return;
        }
        console.debug(`[${this.constructor.name}] Using default layout. View remains at (0,0).`);
    }

    /**
    * Cleans up the view. 
    * We destroy children but keep the shared textures in the AssetService pool.
    */
    public dispose(): void {
        // In PixiJS v8, we only need to specify 'texture'
        this.destroy({
            children: true,
            texture: false
        });

        globalThis.removeEventListener('keydown', this.onEscapeKeyDown);
        console.debug(`[${this.constructor.name}] View disposed.`);
    }
}