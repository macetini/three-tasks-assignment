// src/core/signal/SignalBus.ts
export class SignalBus extends EventTarget {
    // Function type is now more specific than just 'Function'
    private readonly _handlers = new Map<Function, (e: Event) => void>();

    /**
     * @param type The signal name
     * @param detail The payload of type T
     */
    public emit<T>(type: string, detail?: T): void {
        this.dispatchEvent(new CustomEvent(type, { detail }));
    }

    /**
     * @param type The signal name
     * @param callback The function to execute, receiving detail of type T
     * @param context Optional 'this' context
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

    public off<T>(type: string, callback: (detail: T) => void): void {
        const wrapper = this._handlers.get(callback);

        if (wrapper) {
            this.removeEventListener(type, wrapper);
            this._handlers.delete(callback);
        }
    }
}