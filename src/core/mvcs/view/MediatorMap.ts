// src/core/mvcs/MediatorMap.ts
import type { Application } from "pixi.js";
import type { AssetService } from "../service/AssetService";
import type { AbstractMediator } from "./AbstractMediator";
import type { AbstractView } from "./AbstractView";
import type { SignalBus } from "../../signal/SignalBus";
import type { AbstractMediatorType } from "./type/AbstractMediatorType";

export class MediatorMap {
    private readonly mappings: Map<string, AbstractMediatorType<any>> = new Map();
    private readonly activeMediators: Map<AbstractView, AbstractMediator<any>> = new Map();

    private readonly app: Application;
    private readonly assetService: AssetService;
    private readonly signalBus: SignalBus;

    // TODO. Too many arguments, refactor.
    constructor(app: Application, assetService: AssetService, signalBus: SignalBus) {
        this.app = app;
        this.assetService = assetService;
        this.signalBus = signalBus;
    }

    /**
     * Map a View class to a Mediator class
     */
    public map<V extends AbstractView>(
        viewClass: new (...args: any[]) => V,
        mediatorClass: AbstractMediatorType<V>
    ): void {
        const className = viewClass.name;
        if (!className) {
            throw new Error("[MediatorMap] Cannot map a class without a name.");
        }

        this.mappings.set(className, mediatorClass);
    }

    /**
     * The register function is called when a view is added to the stage
     */
    public register<T extends AbstractView>(view: T): AbstractMediator<T> {
        const MediatorClass = this.mappings.get(view.constructor.name);
        if (!MediatorClass) {
            throw new Error(`[MediatorMap] No Mediator found for ${view.constructor.name}`);
        }
        const mediator = new MediatorClass(view);

        // Inject dependencies
        mediator.setApp(this.app);
        mediator.setAssetService(this.assetService);
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
        console.log(`[MediatorMap] Unregistered mediator for: ${view.constructor.name}`);
    }
}