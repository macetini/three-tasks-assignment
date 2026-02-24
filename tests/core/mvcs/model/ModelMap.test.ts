// tests/core/mvcs/model/ModelMap.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModelMap } from '../../../../src/core/mvcs/model/ModelMap';

describe('ModelMap', () => {
    let modelMap: ModelMap;

    beforeEach(() => {
        modelMap = new ModelMap();
    });

    it('should map and retrieve a model instance', () => {
        const mockModel = { data: 'test' };
        const key = 'testModel';

        modelMap.map(key, mockModel);

        const retrieved = modelMap.get<typeof mockModel>(key);
        expect(retrieved).toBe(mockModel);
        expect(retrieved.data).toBe('test');
    });

    it('should throw an error when retrieving a non-existent model', () => {
        expect(() => {
            modelMap.get('nonExistent');
        }).toThrow('[ModelMap] Model with key "nonExistent" not found.');
    });

    it('should warn when overwriting an existing mapping', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const key = 'sharedKey';

        modelMap.map(key, { id: 1 });
        modelMap.map(key, { id: 2 });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('already mapped and will be overwritten')
        );
        expect(modelMap.get<any>(key).id).toBe(2);
    });

    it('should return a plain object snapshot of the registry', () => {
        const modelA = { name: 'A' };
        const modelB = { name: 'B' };

        modelMap.map('A', modelA);
        modelMap.map('B', modelB);

        const registry = modelMap.getRegistry();

        expect(registry).toEqual({
            A: modelA,
            B: modelB
        });
        // Verify it's a POJO, not the internal Map
        expect(registry).not.toBeInstanceOf(Map);
    });
});