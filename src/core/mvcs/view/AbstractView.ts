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
        console.log(`[${this.constructor.name}] initialized.`);
    };

    public layout(width: number, height: number): void {
        this.x = this.y = 0;
        console.log(`[${this.constructor.name}] Using default layout. View remains at (0,0).`);
    };

    /**
     * Standard update loop hook (useful for Task 2's Magic Fire).
     * @param delta frame delta time
     */
    public update(delta: number): void {
        // To be overridden by subclasses if needed
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