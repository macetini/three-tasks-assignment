// tests/core/mvcs/view/MediatorMap.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AbstractMediator } from '../../../../src/core/mvcs/view/AbstractMediator';
import { AbstractView } from '../../../../src/core/mvcs/view/AbstractView';
import { MediatorMap } from '../../../../src/core/mvcs/view/MediatorMap';

class MockView extends AbstractView { }

class MockMediator extends AbstractMediator<MockView> {
    public onRegister = vi.fn();
    public onRemove = vi.fn();

    public getDependencies() {
        return { app: this.app, bus: this.signalBus, models: this.modelMap };
    }
}

describe('MediatorMap', () => {
    let mediatorMap: MediatorMap;
    let mockApp: any;
    let mockBus: any;
    let mockModels: any;

    beforeEach(() => {
        mockApp = { renderer: { on: vi.fn(), off: vi.fn() } };
        mockBus = { emit: vi.fn() };
        mockModels = {};

        mediatorMap = new MediatorMap(mockApp, mockBus, mockModels);
    });

    describe('Mapping & Registration', () => {
        it('should create and initialize a mediator when a view is registered', () => {
            mediatorMap.map(MockView, MockMediator);

            const view = new MockView();
            const mediator = mediatorMap.register(view) as MockMediator;

            expect(mediator).toBeInstanceOf(MockMediator);

            const deps = mediator.getDependencies();
            expect(deps.app).toBe(mockApp);
            expect(deps.bus).toBe(mockBus);
            expect(deps.models).toBe(mockModels);

            expect(mediator.onRegister).toHaveBeenCalled();
        });

        it('should throw an error if registering a view that has no mapping', () => {
            const view = new MockView();
            expect(() => mediatorMap.register(view)).toThrow(/No Mediator found/);
        });

        it('should throw an error when mapping an anonymous class', () => {
            expect(() => mediatorMap.map(class extends AbstractView { }, MockMediator)).toThrow();
        });
    });

    describe('Unregistration', () => {
        it('should call onRemove and delete the reference when unregistering', () => {
            mediatorMap.map(MockView, MockMediator);
            const view = new MockView();
            const mediator = mediatorMap.register(view) as MockMediator;

            mediatorMap.unregister(view);

            expect(mediator.onRemove).toHaveBeenCalled();

            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            mediatorMap.unregister(view);
            expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('No active mediator found'));
            warnSpy.mockRestore();
        });
    });
});