import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { ModelMap } from '../src/core/mvcs/model/ModelMap';

describe('ModelMap', () => {
    let modelMap: ModelMap;

    beforeEach(() => {
        modelMap = new ModelMap();
    });

    test('map() should store a model and get() should retrieve it', () => {
        const mockModel = { data: 'test_data' };
        const KEY = 'TEST_MODEL';

        modelMap.map(KEY, mockModel);

        const retrieved = modelMap.get<typeof mockModel>(KEY);
        expect(retrieved).toBe(mockModel);
        expect(retrieved.data).toBe('test_data');
    });

    test('map() should log a warning when overwriting an existing key', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
        const KEY = 'DUPLICATE_KEY';

        modelMap.map(KEY, { id: 1 });
        modelMap.map(KEY, { id: 2 });

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('already mapped'));
        expect(modelMap.get<{ id: number }>(KEY).id).toBe(2);

        warnSpy.mockRestore();
    });

    test('get() should throw an error if the model is not found', () => {
        expect(() => modelMap.get('MISSING_KEY')).toThrow(/not found/);
    });

    test('getRegistry() should return a plain object snapshot of all models', () => {
        modelMap.map('A', { val: 1 });
        modelMap.map('B', { val: 2 });

        const registry = modelMap.getRegistry();

        expect(registry).toEqual({
            A: { val: 1 },
            B: { val: 2 }
        });
        // Verify it's a new object (snapshot)
        expect(registry).not.toBe(modelMap['models']);
    });
});