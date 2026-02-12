// src/core/signal/SignalBus.ts
/**
 * A central messaging hub leveraging the native EventTarget API.
 * This class facilitates decoupled communication between the MVCS layers
 * using type-safe payloads and context-aware listeners.
 */
export class SignalBus extends EventTarget {
    /**
     * Internal registry to map original callbacks to their bound EventListener wrappers.
     * Uses a composite key (type + callback) to allow the same function 
     * to listen to multiple signals safely.
     */
    private readonly _handlers = new Map<Function, (e: Event) => void>();

    /**
     * Dispatches a signal across the application.
     * 
     * @template T - The type of the payload.
     * 
     * @param type - The unique signal identifier (from ModelSignals).
     * @param detail - The data payload to transmit.
     */
    public emit<T>(type: string, detail?: T): void {
        this.dispatchEvent(new CustomEvent(type, { detail }));
    }


    /**
     * Registers a callback to receive signals of the given type.
     * 
     * @template T - The type of the payload.
     * 
     * @param type - The unique signal identifier (from ModelSignals).
     * @param callback - The function to call when the signal is received.
     * @param context - Optional context to bind the callback to (if omitted, will not be bound).
     */
    public on<T>(type: string, callback: (detail: T) => void, context?: any): void {
        const boundCallback = context ? callback.bind(context) : callback;

        // CustomEvent is generic in modern TypeScript
        const wrapper = (e: Event) => {
            const customEvent = e as CustomEvent<T>;
            boundCallback(customEvent.detail);
        };

        this._handlers.set(callback, wrapper);
        this.addEventListener(type, wrapper);
    }

    /**
     * Removes a previously registered event handler.
     * @param type The signal name
     * @param callback The function to remove, which was previously registered with on<T>
     */
    public off<T>(type: string, callback: (detail: T) => void): void {
        const wrapper = this._handlers.get(callback);

        if (wrapper) {
            this.removeEventListener(type, wrapper);
            this._handlers.delete(callback);
        }
    }
}