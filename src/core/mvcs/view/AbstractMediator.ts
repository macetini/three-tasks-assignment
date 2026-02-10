// src/core/mvcs/mediators/AbstractMediator.ts
import type { AssetService } from '../service/AssetService';
import type { AbstractView } from './AbstractView';
import type { MediatorMap } from './MediatorMap';

export abstract class AbstractMediator<T extends AbstractView> {
    protected view!: T;
    protected assetService!: AssetService;
    protected mediatorMap!: MediatorMap;
    //protected signalBus!: SignalBus;

    constructor(view: T) {
        this.view = view;
    }

    public setterInject(assetService: AssetService, mediatorMap: MediatorMap): void {
        this.assetService = assetService;
        this.mediatorMap = mediatorMap;
    }

    /**
     * Equivalent to initialize() in RobotLegs.
     * Call this after the view is added to the stage.
     */
    public onRegister(): void {
        console.log(`[${this.constructor.name}] onRegister()`);
    }

    /**
     * Destructor to clean up listeners, intervals, and GSAP tweens.
     */
    public onRemove(): void {
        console.log(`[${this.constructor.name}] onRemove()`);
        // In a real framework, we would auto-remove signal listeners here.
    }

    public viewComponent(): T { return this.view; }
}