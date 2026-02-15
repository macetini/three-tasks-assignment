// src/core/mvcs/views/AbstractView.ts
import { Text } from 'pixi.js';
import { GameConfig } from '../../config/GameConfig';
import { AbstractMediator } from './AbstractMediator';
import { AbstractView } from './AbstractView';

/**
 * Base class for all views in the MVCS architecture.
 * Extends AbstractView and provides additional functionality for task views.
 */
export abstract class TaskView extends AbstractView {
    public static readonly VIEW_ADDED_TO_ROOT_EVENT = 'viewAddedToRootEvent';

    /**
     * Initializes the TaskView.
     * Calls the parent's init() method and then creates the default back button
     * that every view except the root one will have.
     */
    public init(): void {
        super.init();
        console.debug(`[${this.constructor.name}] View initialized.`);
        this.createBackButton();
    };

    /**
     * Creates the default back button that every view except the root one will have.
     * The back button is added to the top-left of the screen.     
     */
    protected createBackButton(): void {
        console.debug(`[${this.constructor.name}] Adding default back button.`);
        const backBtn = new Text({
            text: GameConfig.GLOBAL.BACK_BUTTON_GRAPHIC,
            style: { fill: 'white', fontSize: 36 }
        });

        backBtn.interactive = true;
        backBtn.cursor = 'pointer';
        backBtn.position.set(GameConfig.GLOBAL.BACK_BUTTON_X, GameConfig.GLOBAL.BACK_BUTTON_Y);

        backBtn.on('pointertap', () => this.emit(AbstractMediator.BACK_CLICK_EVENT));

        globalThis.addEventListener('keydown', this.onEscapeKeyDown);

        this.addChild(backBtn);
    }

    /**
     * Global keyboard listener for navigation.
     */
    private readonly onEscapeKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            this.emit(AbstractMediator.BACK_CLICK_EVENT);
        }
    }

    /**
     * Removes the global keyboard event listener and calls the super dispose method to
     * clean up the view for garbage collection.
     * Should be called when the view is no longer needed.
     */
    public override dispose(): void {
        globalThis.removeEventListener('keydown', this.onEscapeKeyDown);
        super.dispose();
    }
}