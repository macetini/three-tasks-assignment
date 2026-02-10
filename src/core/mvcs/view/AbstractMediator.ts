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

    /**
     *          
     * Call this after the view is added to the stage.
     */
    public onRegister(): void {
        console.log(`[${this.constructor.name}] onRegister()`);
    }

    /**
     * 
     * Destructor to clean up listeners, intervals, tweens etc..
     */
    public onRemove(): void {
        console.log(`[${this.constructor.name}] onRemove()`);
        // In a real framework, we would auto-remove signal listeners here.
    }

    protected get viewComponent(): T { return this.view; }
}