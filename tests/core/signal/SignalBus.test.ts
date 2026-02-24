// tests/core/signal/SignalBus.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SignalBus } from '../../../src/core/signal/SignalBus';

describe('SignalBus', () => {
    let bus: SignalBus;

    beforeEach(() => {
        bus = new SignalBus();
    });

    it('should emit and receive a signal with a payload', () => {
        const callback = vi.fn();
        const testData = { id: 123, status: 'ok' };
        const signalType = 'TEST_SIGNAL';

        bus.on(signalType, callback);
        bus.emit(signalType, testData);

        expect(callback).toHaveBeenCalledWith(testData);
    });

    it('should maintain context when provided', () => {
        const signalType = 'CONTEXT_SIGNAL';
        const context = { name: 'TestContext', value: 0 };

        function callback(this: typeof context, payload: number) {
            this.value = payload;
        }

        bus.on(signalType, callback, context);
        bus.emit(signalType, 42);

        expect(context.value).toBe(42);
    });

    it('should correctly remove listeners using the off method', () => {
        const callback = vi.fn();
        const signalType = 'REMOVAL_SIGNAL';

        bus.on(signalType, callback);
        bus.off(signalType, callback);

        bus.emit(signalType, 'ignored');

        expect(callback).not.toHaveBeenCalled();
        // Internal registry should be clean
        expect((bus as any)._handlers.has(callback)).toBe(false);
    });

    it('should handle multiple listeners for the same signal', () => {
        const cb1 = vi.fn();
        const cb2 = vi.fn();
        const signalType = 'MULTI_SIGNAL';

        bus.on(signalType, cb1);
        bus.on(signalType, cb2);
        bus.emit(signalType, true);

        expect(cb1).toHaveBeenCalledWith(true);
        expect(cb2).toHaveBeenCalledWith(true);
    });

    it('should not crash when calling off for a non-existent listener', () => {
        const dummyCb = () => { };
        expect(() => bus.off('NONE', dummyCb)).not.toThrow();
    });
});