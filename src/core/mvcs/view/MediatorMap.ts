// src/core/mvcs/MediatorMap.ts
import type { Application } from "pixi.js";
import type { AssetService } from "../service/AssetService";
import type { AbstractMediator } from "./AbstractMediator";
import type { AbstractView } from "./AbstractView";
import type { SignalBus } from "../../signal/SignalBus";

type MediatorClass<T extends AbstractView> = new (view: T) => AbstractMediator<T>;

export class MediatorMap {
    private readonly mappings: Map<string, MediatorClass<any>> = new Map();

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
        mediatorClass: MediatorClass<V>
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

        // Inject dependencies one by one
        mediator.setApp(this.app);
        mediator.setAssetService(this.assetService);
        mediator.setSignalBus(this.signalBus);
        mediator.setMediatorMap(this);
        //

        // Call the onRegister() method
        mediator.onRegister();
        return mediator;
    }
}