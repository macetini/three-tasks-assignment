import { EventEmitter } from 'pixi.js';

/**
 * A central messaging hub allowing mediators to communicate 
 * without being directly coupled to each other.
 */
export class SignalBus extends EventTarget {
    /**
     * Dispatches a custom event with details
     */
    public emit(type: string, detail?: any): void {
        this.dispatchEvent(new CustomEvent(type, { detail }));
    }

    /**
     * Helper to add listeners quickly
     */
    public on(type: string, callback: (detail: any) => void): void {
        // We wrap it to extract the 'detail' automatically
        const wrapper = (e: any) => callback(e.detail);
        // Store the wrapper on the callback so we can remove it later
        (callback as any)._wrapper = wrapper;
        this.addEventListener(type, wrapper);
    }

    /**
     * Helper to remove listeners
     */
    public off(type: string, callback: (detail: any) => void): void {
        const wrapper = (callback as any)._wrapper;
        if (wrapper) {
            this.removeEventListener(type, wrapper);
        }
    }
}