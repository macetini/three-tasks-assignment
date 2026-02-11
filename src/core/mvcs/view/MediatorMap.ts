// src/core/mvcs/MediatorMap.ts
import type { Application } from "pixi.js";
import type { SignalBus } from "../../signal/SignalBus";
import type { AbstractMediator } from "./AbstractMediator";
import type { AbstractView } from "./AbstractView";
import type { AbstractMediatorType } from "./type/AbstractMediatorType";

export class MediatorMap {
    // We use AbstractMediator<any> here because the Map doesn't know 
    // which specific subtype it's holding at any given moment.
    private readonly mappings: Map<string, AbstractMediatorType<any>> = new Map();
    private readonly activeMediators: Map<AbstractView, AbstractMediator<any>> = new Map();

    private readonly app: Application;    
    private readonly signalBus: SignalBus;
    
    constructor(app: Application, signalBus: SignalBus) {
        this.app = app;        
        this.signalBus = signalBus;
    }

    /**
     * Map a View class to a Mediator class
     */
    public map<V extends AbstractView>(
        viewClass: new () => V,
        mediatorClass: AbstractMediatorType<V>
    ): void {
        const className = viewClass.name;
        if (!className) {
            throw new Error("[MediatorMap] Cannot map a class without a name.");
        }

        this.mappings.set(className, mediatorClass as AbstractMediatorType<any>);
    }

    /**
     * The register function is called when a view is added to the stage
     */
    public register<T extends AbstractView>(view: T): AbstractMediator<T> {
        const Constructor = this.mappings.get(view.constructor.name);

        if (!Constructor) {
            throw new Error(`[MediatorMap] No Mediator found for ${view.constructor.name}`);
        }

        // Cast the generic constructor to the specific view type T
        const mediator = new Constructor(view) as AbstractMediator<T>;

        mediator.setApp(this.app);
        mediator.setSignalBus(this.signalBus);
        mediator.setMediatorMap(this);

        mediator.onRegister();

        this.activeMediators.set(view, mediator);
        return mediator;
    }

    /**
     * Finds the mediator associated with this view, calls onRemove, and cleans up.
     */
    public unregister(view: AbstractView): void {
        const mediator = this.activeMediators.get(view);
        if (!mediator) {
            console.warn(`[MediatorMap] No active mediator found for: ${view.constructor.name}`);
            return;
        }

        mediator.onRemove();
        this.activeMediators.delete(view);
    }
}