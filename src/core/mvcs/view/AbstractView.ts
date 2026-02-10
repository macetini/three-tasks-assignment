// src/core/mvcs/views/AbstractView.ts
import { Container } from 'pixi.js';

export abstract class AbstractView extends Container {

    constructor() {
        super();
    }

    /**
     * Called by the Mediator or Parent during the setup phase.
     * Use this to create children, setup layout, etc.
     */
    public init(): void {
        console.log(`[${this.constructor.name}] View initialized.`);
    };

    /**
     * 
     * Called by the Mediator or Parent during the render phase.
     * 
     * @param width Width of the screen
     * @param height Height of the screen
     */
    public layout(width: number, height: number): void {
        if (width <= 0 || height <= 0) {
            console.log(`[${this.constructor.name}] Skipping layout update due to collapsed renderer.`);
            return;
        }
        console.log(`[${this.constructor.name}] Using default layout. View remains at (0,0).`);
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

        console.log(`[${this.constructor.name}] View disposed.`);
    }
}