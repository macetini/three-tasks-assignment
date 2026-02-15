import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { CommandMap } from '../src/core/mvcs/controller/CommandMap';
import { AbstractCommand } from '../src/core/mvcs/controller/AbstractCommand';
import { SignalBus } from '../src/core/signal/SignalBus';

/**
 * A concrete mock command to test instantiation, injection, and execution.
 */
class MockCommand extends AbstractCommand<string> {
    public execute: jest.Mock<() => void | Promise<void>> = jest.fn();
}

describe('CommandMap', () => {
    let commandMap: CommandMap;
    let mockSignalBus: SignalBus;
    let mockAssetService: any;
    let mockModelMap: any;

    beforeEach(() => {
        mockSignalBus = new SignalBus();
        mockAssetService = { load: jest.fn() };
        mockModelMap = { get: jest.fn() };

        commandMap = new CommandMap(mockSignalBus, mockAssetService, mockModelMap);
    });

    test('map() should link a signal to a Command and execute it when emitted', () => {
        let commandInstance: MockCommand | null = null;

        const TestCommand = class extends MockCommand {
            constructor(payload: string) {
                super(payload);
                commandInstance = this;
            }
        };

        commandMap.map('TEST_SIGNAL', TestCommand as any);
        mockSignalBus.emit('TEST_SIGNAL', 'Hello Command');

        expect(commandInstance).not.toBeNull();

        const instance = commandInstance as unknown as MockCommand;

        expect(instance['payload']).toBe('Hello Command');
        expect(instance.execute).toHaveBeenCalled();

        expect((instance as any).signalBus).toBe(mockSignalBus);
    });

    test('should throw TypeError if the mapped class does not extend AbstractCommand', () => {
        const InvalidClass = class {
            execute() { /* no-op */ }
        };

        commandMap.map('INVALID_SIGNAL', InvalidClass as any);

        expect(() => {
            (commandMap as any).execute('INVALID_SIGNAL');
        }).toThrow(TypeError);
    });

    test('execute() should handle undefined payloads gracefully', () => {
        let capturedPayload: any = "initial";

        const PayloadCommand = class extends AbstractCommand {
            public execute() { capturedPayload = this.payload; }
        };

        commandMap.map('NULL_SIGNAL', PayloadCommand as any);
        mockSignalBus.emit('NULL_SIGNAL');

        expect(capturedPayload).toBeNull();
    });
});