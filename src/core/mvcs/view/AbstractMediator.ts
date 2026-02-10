// src/core/mvcs/mediators/AbstractMediator.ts
import type { Application } from 'pixi.js';
import type { AssetService } from '../service/AssetService';
import type { AbstractView } from './AbstractView';
import type { MediatorMap } from './MediatorMap';
import type { SignalBus } from '../../signal/SignalBus';

export abstract class AbstractMediator<T extends AbstractView> {
    protected view!: T;
    protected app!: Application;
    protected assetService!: AssetService;
    protected signalBus!: SignalBus;
    protected mediatorMap!: MediatorMap;

    constructor(view: T) {
        this.view = view;
    }

    /**
     *          
     * Call this after the view is added to the stage.
     */
    public onRegister(): void {
        console.log(`[${this.constructor.name}] ${this.view.constructor.name} is registered.`);
        this.setupResponsiveLayout();
    }

    /**
     * 
     * Destructor to clean up listeners, intervals, tweens etc..
     */
    public onRemove(): void {
        console.log(`[${this.constructor.name}] ${this.view.constructor.name} is removed.`);
        this.app.renderer.off('resize', this.onResize)
    }

    /**
     * Call this in onRegister() if your mediator needs to handle resizing.
     */
    protected setupResponsiveLayout(): void {
        // Initial snap
        requestAnimationFrame(() => this.triggerLayout());
        // Listener
        this.app.renderer.on('resize', this.onResize);
    }

    private readonly onResize = (): void => {
        this.triggerLayout();
    };

    /**
     * Logic to actually trigger the layout on the view.
     * We can still keep this 'protected' in case a specific mediator 
     * needs to add extra logic (like your height sanity check).
     */
    protected triggerLayout(): void {
        const { width, height } = this.app.screen;

        // A generic sanity check: don't layout if the renderer is collapsed
        if (width <= 0 || height <= 0) {
            console.error('[AbstractMediator] Skipping layout update due to collapsed renderer');
            return;
        }

        // Run the guard check. If it passes, execute the layout.
        if (this.isValidLayout(width, height)) {
            this.view.layout(width, height);
        }
    }

    /**
     * Override this in specific mediators to add logic like your 1.5x height check.
     */
    protected isValidLayout(width: number, height: number): boolean {
        return true;
    }

    // --- Dependency Injection ---

    public setApp(app: Application): void {
        this.app = app;
    }

    public setAssetService(service: AssetService): void {
        this.assetService = service;
    }

    public setSignalBus(bus: SignalBus): void {
        this.signalBus = bus;
    }

    public setMediatorMap(map: MediatorMap): void {
        this.mediatorMap = map;
    }
    // --- End of Dependency Injection ---

    protected get viewComponent(): T { return this.view; }
}