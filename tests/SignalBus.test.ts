import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { SignalBus } from '../src/core/signal/SignalBus';

describe('SignalBus', () => {
    let signalBus: SignalBus;

    beforeEach(() => {
        signalBus = new SignalBus();
    });

    test('on() and emit() should transmit data correctly', () => {
        const signalName = 'TEST_SIGNAL';
        const payload = { score: 100, name: 'Gemini' };
        const callback = jest.fn();

        signalBus.on(signalName, callback);
        signalBus.emit(signalName, payload);

        expect(callback).toHaveBeenCalledWith(payload);
    });

    test('on() with context should bind correctly', () => {
        const signalName = 'CONTEXT_SIGNAL';
        const context = { value: 'Success' };

        // We use a regular function to test 'this' binding
        function callback(this: typeof context) {
            expect(this.value).toBe('Success');
        }

        signalBus.on(signalName, callback, context);
        signalBus.emit(signalName);
    });

    test('off() should successfully remove the listener', () => {
        const signalName = 'REMOVE_SIGNAL';
        const callback = jest.fn();

        signalBus.on(signalName, callback);
        signalBus.off(signalName, callback);

        signalBus.emit(signalName);

        expect(callback).not.toHaveBeenCalled();
    });

    test('emit() should work without a payload', () => {
        const signalName = 'NO_PAYLOAD';
        const callback = jest.fn();

        signalBus.on(signalName, callback);
        signalBus.emit(signalName);

        expect(callback).toHaveBeenCalledWith(null);
    });

    test('should allow multiple handlers for the same signal', () => {
        const signalName = 'MULTI_SIGNAL';
        const cb1 = jest.fn();
        const cb2 = jest.fn();

        signalBus.on(signalName, cb1);
        signalBus.on(signalName, cb2);

        signalBus.emit(signalName);

        expect(cb1).toHaveBeenCalled();
        expect(cb2).toHaveBeenCalled();
    });
});