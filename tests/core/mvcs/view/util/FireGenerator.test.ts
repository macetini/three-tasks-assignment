import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FireGenerator } from '../../../../../src/core/mvcs/view/util/FireGenerator';
import { Graphics } from 'pixi.js';

describe('FireGenerator', () => {
    let generator: FireGenerator;
    let mockRenderer: any;

    beforeEach(() => {
        generator = new FireGenerator();
        // Mock the PIXI Renderer
        mockRenderer = {
            generateTexture: vi.fn().mockReturnValue({
                destroy: vi.fn(),
                valid: true
            })
        };
    });

    it('should generate a flame texture using procedural drawing', () => {
        const texture = generator.generateFlameTexture(mockRenderer);

        // Verify the renderer was called with the specific config
        expect(mockRenderer.generateTexture).toHaveBeenCalledWith(
            expect.objectContaining({
                antialias: true,
                // Check if target is a Graphics instance (via our mock)
                target: expect.any(Graphics)
            })
        );

        // Ensure we get a texture back
        expect(texture).toBeDefined();
        expect((texture as any).valid).toBe(true);
    });

    it('should draw a glow layer and a core teardrop layer', () => {
        // inspect the Graphics calls        
        const graphicsSpy = vi.spyOn(Graphics.prototype, 'bezierCurveTo');
        const circleSpy = vi.spyOn(Graphics.prototype, 'circle');

        generator.generateFlameTexture(mockRenderer);

        // Verify the "Glow" was drawn
        expect(circleSpy).toHaveBeenCalled();

        // Verify the "Teardrop" core was drawn using Bezier curves
        // (The code uses 2 bezierCurveTo calls for the flame shape)
        expect(graphicsSpy).toHaveBeenCalledTimes(2);
    });

    it('should destroy the graphics object after baking to prevent memory leaks', () => {
        const destroySpy = vi.spyOn(Graphics.prototype, 'destroy');

        generator.generateFlameTexture(mockRenderer);

        expect(destroySpy).toHaveBeenCalled();
    });
});