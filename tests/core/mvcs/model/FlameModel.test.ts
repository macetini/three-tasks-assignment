// tests/core/mvcs/model/FlameModel.test.ts
import { describe, expect, it } from 'vitest';
import { FlameModel } from '../../../../src/core/mvcs/model/states/FlameModel';

describe('FlameModel', () => {
    it('should store and retrieve the flame texture', () => {
        const model = new FlameModel();
        // Use 'as any' to create a fake texture without TS complaining
        const mockTexture = { label: 'flame_tex' } as any;

        model.setFlameTexture(mockTexture);

        // Direct object reference comparison is the strongest test anyway
        expect(model.flameTexture).toBe(mockTexture);
    });

    it('should overwrite the texture if set multiple times', () => {
        const model = new FlameModel();
        const tex1 = { label: 'old' } as any;
        const tex2 = { label: 'new' } as any;

        model.setFlameTexture(tex1);
        model.setFlameTexture(tex2);

        expect(model.flameTexture).toBe(tex2);
    });
});