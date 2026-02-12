// src/core/mvcs/MediatorMap.ts
import type { Application } from "pixi.js";
import type { SignalBus } from "../../signal/SignalBus";
import type { AbstractMediator } from "./AbstractMediator";
import type { AbstractView } from "./AbstractView";
import type { ModelMap } from "../model/ModelMap";

/** Type helper for Mediator constructors */
export type AbstractMediatorType<T extends AbstractView> = new (view: T) => AbstractMediator<T>;

/**
 * The MediatorMap is a Dependency Injection container for the View layer.
 * It manages the automated creation and destruction of Mediators in response
 * to View lifecycle events, ensuring views remain decoupled from business logic.
 */
export class MediatorMap {
    private readonly mappings: Map<string, AbstractMediatorType<AbstractView>> = new Map();
    private readonly activeMediators: Map<AbstractView, AbstractMediator<AbstractView>> = new Map();

    private readonly app: Application;
    private readonly signalBus: SignalBus;
    private readonly modelMap: ModelMap;

    /**
     * Constructor for the MediatorMap class.
     * @param app - The Application instance, used for rendering and event handling.
     * @param signalBus - The SignalBus instance, used for event dispatching.
     * @param modelMap - The ModelMap instance, used for accessing Models.
     */
    constructor(app: Application, signalBus: SignalBus, modelMap: ModelMap) {
        this.app = app;
        this.signalBus = signalBus;
        this.modelMap = modelMap;
    }

    /**
     * Maps a view class to a mediator class.
     * The view class is expected to extend AbstractView, and the mediator class should extend AbstractMediator.
     * The mapping is stored internally and used when a view is registered.
     * A view class without a name cannot be mapped.
     * @param viewClass - The view class to be mapped.
     * @param mediatorClass - The mediator class to be mapped to.
     */
    public map<V extends AbstractView>(
        viewClass: new () => V,
        mediatorClass: AbstractMediatorType<V>
    ): void {
        const className = viewClass.name;
        if (!className) {
            throw new Error("[MediatorMap] Cannot map a class without a name.");
        }
        // We cast to 'unknown' for internal storage. 
        // Safe because the public 'map' signature enforced the V -> M relationship.
        this.mappings.set(
            className,
            mediatorClass as unknown as AbstractMediatorType<AbstractView>
        );
    }

    /**
     * Registers a view with the MediatorMap, creating a new AbstractMediator instance if necessary.
     * The newly created mediator is then initialized and added to the active mediators map.
     * @param view - The view instance to be registered.
     * @returns The newly created or existing AbstractMediator instance for the given view.
     * @throws Error if no mediator is found for the given view class.
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
        mediator.setModelMap(this.modelMap);
        mediator.setMediatorMap(this);

        mediator.onRegister();

        this.activeMediators.set(
            view,
            mediator as unknown as AbstractMediator<AbstractView>
        );
        return mediator;
    }

    /**
     * Unregisters a view from the MediatorMap, removing its associated mediator.
     * If no active mediator is found for the given view, a warning is logged.
     * @param view - The view instance to be unregistered.
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