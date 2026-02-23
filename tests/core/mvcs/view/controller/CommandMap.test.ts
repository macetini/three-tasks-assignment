// tests/core/mvcs/view/controller/CommandMap.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AbstractCommand } from '../../../../../src/core/mvcs/controller/AbstractCommand';
import { CommandMap } from '../../../../../src/core/mvcs/controller/CommandMap';

// A concrete implementation for testing
class TestCommand extends AbstractCommand<string> {
    public execute() {
        // Standard method exists on prototype
    }
}
describe('CommandMap', () => {
    let commandMap: CommandMap;
    let mockSignalBus: any;
    let mockAssetService: any;
    let mockModelMap: any;

    beforeEach(() => {
        vi.clearAllMocks();

        mockSignalBus = {
            on: vi.fn(),
            emit: vi.fn()
        };
        mockAssetService = { id: 'service' };
        mockModelMap = { id: 'models' };

        commandMap = new CommandMap(mockSignalBus, mockAssetService, mockModelMap);
    });

    it('should register a listener on the SignalBus when mapping', () => {
        commandMap.map('TEST_SIGNAL', TestCommand);
        expect(mockSignalBus.on).toHaveBeenCalledWith('TEST_SIGNAL', expect.any(Function));
    });

    it('should instantiate, inject dependencies, and execute command when signal is triggered', () => {
        // We need to capture the callback passed to signalBus.on
        let capturedCallback: (payload: any) => void = () => { };
        mockSignalBus.on.mockImplementation((_type: string, cb: any) => {
            capturedCallback = cb;
        });

        // Map it
        commandMap.map('TEST_SIGNAL', TestCommand);

        // We spy on the prototype to see what happens when 'new TestCommand' is called
        const setDepsSpy = vi.spyOn(TestCommand.prototype, 'setDependencies');
        const executeSpy = vi.spyOn(TestCommand.prototype, 'execute');

        // Simulate the signal being triggered with a payload
        const payload = "Hello World";
        // Trigger the signal
        capturedCallback(payload);

        // Verify injection
        expect(setDepsSpy).toHaveBeenCalledWith({
            signalBus: mockSignalBus,
            assetService: mockAssetService,
            modelMap: mockModelMap
        });
        // Verify execution
        expect(executeSpy).toHaveBeenCalled();
    });

    it('should throw an error if the mapped class is not an AbstractCommand', () => {
        // Force an invalid class into the map (casting to bypass TS for the test)
        const InvalidClass = class {
            public readonly isInvalid = true;
        } as any;

        // We have to reach into private state or simulate the execution
        // Since execute is private, we trigger it via the signal callback
        let capturedCallback: any;
        mockSignalBus.on.mockImplementation((_type: string, cb: any) => capturedCallback = cb);

        commandMap.map('FAIL', InvalidClass);

        expect(() => capturedCallback()).toThrow(TypeError);
    });
});