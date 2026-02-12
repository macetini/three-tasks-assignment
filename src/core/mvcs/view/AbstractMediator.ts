// src/core/mvcs/mediators/AbstractMediator.ts
import type { Application } from 'pixi.js';
import type { SignalBus } from '../../signal/SignalBus';
import { ModelSignals } from '../../signal/ModelSignals';
import { TaskSignals } from '../../signal/TaskSignals';
import type { ModelMap } from '../model/ModelMap';
import { AbstractView } from './AbstractView';
import type { MediatorMap } from './MediatorMap';

/**
 * Base class for all Mediators in the MVCS architecture.
 * Provides a standardized lifecycle for view management, including:
 * 1. Automatic dependency injection (App, SignalBus, Models).
 * 2. Standardized responsive layout handling.
 * 3. Lifecycle hooks for registration and stage entry.
 */
export abstract class AbstractMediator<T extends AbstractView> {
    public static readonly BACK_CLICK_EVENT = 'backClickEvent';

    protected view!: T;
    protected app!: Application;
    protected signalBus!: SignalBus;
    protected modelMap!: ModelMap;
    protected mediatorMap!: MediatorMap;

    /**
     * Constructor for the AbstractMediator class.
     * Sets the view instance that the mediator will manage.
     * 
     * @param view - The view instance to be managed.
     */
    constructor(view: T) {
        this.view = view;
    }

    /**
     * Called after the mediator is registered.
     * Sets up the event listener for the back button click event and
     * triggers the setup of the responsive layout.
     * Also sets up a one-time event listener for the view added to root event.
     */
    public onRegister(): void {
        console.debug(`[${this.constructor.name}] Mediator registered.`);

        this.setupResponsiveLayout();

        this.view.on(AbstractMediator.BACK_CLICK_EVENT, this.onBackClickEvent);
        this.view.once(AbstractView.VIEW_ADDED_TO_ROOT_EVENT, () => this.onViewAddedToRoot());
    }

    /**
     * Called when the view is added to the stage.
     * Triggers a layout update and logs a debug message to indicate that the view
     * has been added to the stage.
     */
    protected onViewAddedToRoot(): void {
        console.debug(`[${this.constructor.name}] View added to Root.`);
    }

    /**
     * Called when the mediator is no longer needed.
     * Removes all event listeners and cleans up the mediator for garbage collection.
     * Offs the 'resize' event listener on the PIXI renderer and the
     * AbstractMediator.BACK_CLICK_EVENT event listener on the view component.
     */
    public onRemove(): void {
        console.debug(`[${this.constructor.name}] Mediator removed.`);
        this.app.renderer.off('resize', this.onResize);
        this.viewComponent.off(AbstractMediator.BACK_CLICK_EVENT, this.onBackClickEvent);
    }

    /**
     * Handles the back click event by emitting the ModelSignals.SWITCH_TASK signal
     * with the TaskSignals.MAIN payload.
     */
    private readonly onBackClickEvent = (): void => {
        console.debug('[AceOfShadowsMediator] Handling: ', AbstractMediator.BACK_CLICK_EVENT);
        this.signalBus.emit(ModelSignals.SWITCH_TASK, TaskSignals.MAIN);
    }

    /**
     * Sets up the responsive layout for the view by triggering a layout update
     * via requestAnimationFrame and adding a listener for the 'resize' event on the
     * PIXI renderer. This ensures that the view is always laid out according to the
     * current screen size and resolution.
     */
    protected setupResponsiveLayout(): void {
        requestAnimationFrame(() => this.triggerLayout());
        this.app.renderer.on('resize', this.onResize);
    }

    private readonly onResize = (): void => {
        this.triggerLayout();
    };


    /**
     * Triggers the layout of the View, checking for a valid screen size first.
     * If the screen size is invalid, a warning is logged and the layout is skipped.
     * Otherwise, the View is laid out at the current screen size.
     * 
     * @remarks
     * This method is typically called by the Mediator in response to a resize event.
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
     * Architectural Guard: Validation logic for the layout lifecycle.
     * Prevents UI "flickering" or "jumping" by filtering out anomalous 
     * browser dimension reports during rapid resizing or orientation changes.
     * 
     * @param width - The target layout width.
     * @param height - The target layout height.
     * @returns True if dimensions are within a realistic range.
     */
    protected isValidLayout(width: number, height: number): boolean {
        return width > 0 && height > 0;
    }


    /**
     * Sets the Application instance used for rendering and event dispatching.
     * 
     * @param app - The Application instance to be used.
     */
    public setApp(app: Application): void {
        this.app = app;
    }

    /**
     * Sets the SignalBus instance used for event dispatching.
     * 
     * @param bus - The SignalBus instance to be used.
     */
    public setSignalBus(bus: SignalBus): void {
        this.signalBus = bus;
    }

    /**
     * Sets the ModelMap instance used for accessing Models.
     * @param map - The ModelMap instance to be used.
     */
    public setModelMap(map: ModelMap): void {
        this.modelMap = map;
    }

    /**
     * Sets the MediatorMap instance used for registering and unregistering Mediators.
     * @param map - The MediatorMap instance to be used.
     */
    public setMediatorMap(map: MediatorMap): void {
        this.mediatorMap = map;
    }

    /**
     * Returns the view component. Can be cast to the specific view type.
     */
    protected get viewComponent(): T { return this.view; }
}