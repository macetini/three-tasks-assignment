import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { AbstractMediator } from '../src/core/mvcs/view/AbstractMediator';
import { AbstractView } from '../src/core/mvcs/view/AbstractView';
import { MediatorMap } from '../src/core/mvcs/view/MediatorMap';

// 1. Create Mock classes for the test
class MockView extends AbstractView { }
class MockMediator extends AbstractMediator<MockView> {
    public onRegister = jest.fn();
    public onRemove = jest.fn();
}

describe('MediatorMap', () => {
    let mediatorMap: MediatorMap;
    let mockApp: any;
    let mockSignalBus: any;
    let mockModelMap: any;

    beforeEach(() => {
        mockApp = { renderer: {} };
        mockSignalBus = { on: jest.fn(), off: jest.fn() };
        mockModelMap = { get: jest.fn() };

        mediatorMap = new MediatorMap(mockApp, mockSignalBus, mockModelMap);
    });

    test('map() should store a mapping between view and mediator', () => {
        mediatorMap.map(MockView, MockMediator as any);
        // Using bracket notation to check private property for verification
        expect(mediatorMap['mappings'].has('MockView')).toBe(true);
    });

    test('register() should throw error if no mapping exists', () => {
        const unmappedView = new MockView();
        expect(() => mediatorMap.register(unmappedView)).toThrow(/No Mediator found/);
    });

    test('register() should create, inject, and initialize a mediator', () => {
        mediatorMap.map(MockView, MockMediator as any);
        const view = new MockView();

        const mediator = mediatorMap.register(view) as MockMediator;

        // Verify Injection
        expect((mediator as any).app).toBe(mockApp);
        expect((mediator as any).signalBus).toBe(mockSignalBus);
        expect((mediator as any).modelMap).toBe(mockModelMap);

        // Verify Lifecycle call
        expect(mediator.onRegister).toHaveBeenCalled();

        // Verify it's stored in activeMediators
        expect(mediatorMap['activeMediators'].has(view)).toBe(true);
    });

    test('unregister() should call onRemove and clean up storage', () => {
        mediatorMap.map(MockView, MockMediator as any);
        const view = new MockView();
        const mediator = mediatorMap.register(view) as MockMediator;

        mediatorMap.unregister(view);

        expect(mediator.onRemove).toHaveBeenCalled();
        expect(mediatorMap['activeMediators'].has(view)).toBe(false);
    });

    test('unregister() should log warning if no mediator is found', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        const view = new MockView();

        mediatorMap.unregister(view);

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('No active mediator found'));
        warnSpy.mockRestore();
    });
});