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
     * @param w Width of the screen
     * @param h Height of the screen
     */
    public layout(w: number, h: number): void {
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