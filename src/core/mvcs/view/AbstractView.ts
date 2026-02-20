// src/core/mvcs/views/AbstractView.ts
import { Container } from 'pixi.js';

/**
 * Base class for all display components within the MVCS architecture.
 * Provides a standardized lifecycle for:
 * 1. Initialization and UI Injection (Back buttons, HUDs).
 * 2. Responsive layout updates.
 * 3. Memory-safe disposal and texture preservation.
 */
export abstract class AbstractView extends Container {
    /**     
     * Dispatched when the view is added to the stage.
     * 
     * @see RootViewMediator.addAndRegister
     */
    public static readonly VIEW_ADDED_TO_ROOT_EVENT = 'viewAddedToRootEvent';

    /**
     * Called by the Mediator or Parent during the setup phase.
     * Use this to create children, setup layout, etc.
     */
    public init(): void {
        console.debug(`[${this.constructor.name}] View initialized.`);
    };

    /**
     * Called by the Mediator or Parent after the view has been added to the stage.
     * Triggers a layout update and logs a debug message to indicate that the view
     * has been added to the stage.
     */
    public onAddedToRoot(): void {
        console.debug(`[${this.constructor.name}] View added to root.`);
    }

    /**
     * Lays out the view based on the provided dimensions.
     * If either the width or height is less than or equal to 0, a warning is logged and the layout update is skipped.
     * By default, the view remains at position (0,0) if no custom layout is provided.
     * 
     * @param width - The target layout width.
     * @param height - The target layout height.
     */
    public layout(width: number, height: number): void {
        if (width <= 0 || height <= 0) {
            console.warn(`[${this.constructor.name}] Skipping layout update due to collapsed renderer.`);
        }
        // Too much logging (enable if needed)
        //console.debug(`[${this.constructor.name}] Using default layout. View remains at (0,0).`);
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

        console.debug(`[${this.constructor.name}] View disposed.`);
    }
}