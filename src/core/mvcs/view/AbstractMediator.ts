// src/core/mvcs/mediators/AbstractMediator.ts
import type { Application } from 'pixi.js';
import type { SignalBus } from '../../signal/SignalBus';
import { ModelSignals } from '../../signal/ModelSignals';
import { TaskSignals } from '../../signal/TaskSignals';
import type { ModelMap } from '../model/ModelMap';
import { AbstractView } from './AbstractView';
import type { MediatorMap } from './MediatorMap';

export abstract class AbstractMediator<T extends AbstractView> {
    public static readonly BACK_CLICK_EVENT = 'backClickEvent';

    protected view!: T;
    protected app!: Application;
    protected signalBus!: SignalBus;
    protected modelMap!: ModelMap;
    protected mediatorMap!: MediatorMap;

    constructor(view: T) {
        this.view = view;
    }

    /**
     *          
     * Call this after the view is added to the stage.
     */
    public onRegister(): void {
        console.debug(`[${this.constructor.name}] Mediator registered.`);

        this.setupResponsiveLayout();

        this.view.on(AbstractMediator.BACK_CLICK_EVENT, this.onBackClickEvent);
        this.view.once(AbstractView.VIEW_ADDED_TO_ROOT_EVENT, () => this.onViewAddedToRoot());
    }

    /**
     * 
     * Call this when the view has been added to the stage.
     */
    protected onViewAddedToRoot(): void {
        console.debug(`[${this.constructor.name}] View added to Root.`);
    }

    /**
     * 
     * Destructor to clean up listeners, intervals, tweens etc..
     */
    public onRemove(): void {
        console.debug(`[${this.constructor.name}] Mediator removed.`);
        this.app.renderer.off('resize', this.onResize);
        this.viewComponent.off(AbstractMediator.BACK_CLICK_EVENT, this.onBackClickEvent);
    }

    private readonly onBackClickEvent = (): void => {
        console.debug('[AceOfShadowsMediator] Handling: ', AbstractMediator.BACK_CLICK_EVENT);
        this.signalBus.emit(ModelSignals.SWITCH_TASK, TaskSignals.MAIN);
    }

    /**
     * Call this in onRegister() if your mediator needs to handle resizing.
     */
    protected setupResponsiveLayout(): void {
        requestAnimationFrame(() => this.triggerLayout());
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
            console.warn('[AbstractMediator] Skipping layout update due to collapsed renderer');
            return;
        }

        // Run the guard check. If it passes, execute the layout.
        if (this.isValidLayout(width, height)) {
            this.view.layout(width, height);
        } else {
            console.warn('[AbstractMediator] Layout validation failed.');
        }
    }

    /**
     * Override this in specific mediators to add logic like your 1.5x height check.
     */
    protected isValidLayout(width: number, height: number): boolean {
        return width > 0 && height > 0;
    }

    // --- Dependency Injection ---
    public setApp(app: Application): void {
        this.app = app;
    }

    public setSignalBus(bus: SignalBus): void {
        this.signalBus = bus;
    }

    public setModelMap(map: ModelMap): void {
        this.modelMap = map;
    }

    public setMediatorMap(map: MediatorMap): void {
        this.mediatorMap = map;
    }
    // --- End of Dependency Injection ---

    /**
     * Returns the view component. Can be cast to the specific view type.
     */
    protected get viewComponent(): T { return this.view; }
}