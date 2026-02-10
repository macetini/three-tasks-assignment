// src/core/mvcs/mediators/AbstractMediator.ts
import { Container } from 'pixi.js';
import type { AbstractView } from './AbstractView';

export abstract class AbstractMediator<T extends AbstractView> {
    protected view: T;

    constructor(view: T) {
        this.view = view;
    }

    /**
     * Equivalent to initialize() in RobotLegs.
     * Call this after the view is added to the stage.
     */
    public initialize(): void {
        console.log(`[${this.constructor.name}] initialize()`);
        this.setUtils();
        this.setSignals();
    }

    /**
     * Optional: Hook for setting up utilities (like AssetService/GraphicUtils).
     */
    protected setUtils(): void {
        // To be overridden if needed
    }

    /**
     * Optional: Hook for mapping signals/events to view updates.
     */
    protected setSignals(): void {
        // To be overridden if needed
    }

    /**
     * Destructor to clean up listeners, intervals, and GSAP tweens.
     */
    public destroy(): void {
        console.log(`[${this.constructor.name}] destroy()`);
        // In a real framework, we would auto-remove signal listeners here.
    }
}