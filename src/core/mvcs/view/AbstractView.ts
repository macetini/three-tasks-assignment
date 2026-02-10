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

    public layout(w: number, h: number): void {
        console.log(`[${this.constructor.name}] Using default layout. View remains at (0,0).`);
        const ratio = w / h;

        /*if (h > w) {
            this.onMobilePortraitLayout(w, h);
        } else if (ratio < 1.6) {
            // Tablet / Nest Hub Max
            this.onTabletLayout(w, h);
        } else {
            // Desktop / Mobile Landscape
            this.onDesktopLayout(w, h);
        }*/
    }

    // Default implementations (can be overridden by children)
    protected onTabletLayout(w: number, h: number): void {
        console.log(`[${this.constructor.name}] Using default Tablet layout. View remains at (0,0).`);
    }
    protected onDesktopLayout(w: number, h: number): void {
        console.log(`[${this.constructor.name}] Using default Desktop layout. View remains at (0,0).`);
    }
    protected onMobilePortraitLayout(w: number, h: number): void {
        console.log(`[${this.constructor.name}] Using default Mobile Portrait layout. View remains at (0,0).`);
    }
    protected onMobileLandscapeLayout(w: number, h: number): void {
        console.log(`[${this.constructor.name}] Using default Mobile Landscape layout. View remains at (0,0).`);
    }

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