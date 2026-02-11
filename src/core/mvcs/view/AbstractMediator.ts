// src/core/mvcs/mediators/AbstractMediator.ts
import type { Application } from 'pixi.js';
import type { SignalBus } from '../../signal/SignalBus';
import { ModelType } from '../../signal/type/ModelType';
import { TaskType } from '../../signal/type/TaskType';
import type { AbstractView } from './AbstractView';
import type { MediatorMap } from './MediatorMap';

export abstract class AbstractMediator<T extends AbstractView> {
    public static readonly CARD_BACK_CLICK_EVENT = 'cardBackClick';

    protected view!: T;
    protected app!: Application;
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
        console.debug(`[${this.constructor.name}] Mediator registered.`);
        this.setupResponsiveLayout();
        this.view.on(AbstractMediator.CARD_BACK_CLICK_EVENT, this.onCardBackClickEvent);
    }

    /**
     * 
     * Destructor to clean up listeners, intervals, tweens etc..
     */
    public onRemove(): void {
        console.debug(`[${this.constructor.name}] Mediator removed.`);
        this.app.renderer.off('resize', this.onResize);
        this.viewComponent.off(AbstractMediator.CARD_BACK_CLICK_EVENT, this.onCardBackClickEvent);
    }

    private readonly onCardBackClickEvent = (): void => {
        console.debug('[AceOfShadowsMediator] Handling: ', AbstractMediator.CARD_BACK_CLICK_EVENT);
        this.signalBus.emit(ModelType.SWITCH_TASK, TaskType.MAIN);
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

    public setMediatorMap(map: MediatorMap): void {
        this.mediatorMap = map;
    }
    // --- End of Dependency Injection ---

    /**
     * Returns the view component. Can be cast to the specific view type.
     */
    protected get viewComponent(): T { return this.view; }
}