import { Sprite } from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameConfig } from '../../../../../src/core/config/GameConfig';
import { CardsGenerator } from '../../../../../src/core/mvcs/view/util/CardsGenerator';

describe('CardsGenerator', () => {
    let generator: CardsGenerator;
    let mockRenderer: any;

    beforeEach(() => {
        generator = new CardsGenerator();

        // Mock the PIXI Renderer
        mockRenderer = {
            generateTexture: vi.fn().mockReturnValue({
                destroy: vi.fn()
            })
        };
    });

    it('should generate a single outline texture', () => {
        const texture = generator.generateOutlineTexture(mockRenderer);

        expect(mockRenderer.generateTexture).toHaveBeenCalledTimes(1);
        expect(texture).toBeDefined();
    });

    it('should generate the correct number of template textures based on config', () => {
        const templates = generator.generateMainTextures(mockRenderer);

        expect(templates.length).toBe(GameConfig.CARDS.TEMPLATES_COUNT);
        expect(mockRenderer.generateTexture).toHaveBeenCalledTimes(GameConfig.CARDS.TEMPLATES_COUNT);
    });

    it('should bake the final stack of 144 card sprites', () => {
        const mockOutline = { destroy: vi.fn() } as any;
        const mockTemplates = [{}, {}, {}] as any; // Dummy templates

        const sprites = generator.bakeCardTextures(mockRenderer, mockOutline, mockTemplates);

        // Verify total count
        expect(sprites.length).toBe(GameConfig.CARDS.TOTAL_COUNT);
        // Verify that renderer was called for every single card
        expect(mockRenderer.generateTexture).toHaveBeenCalledTimes(GameConfig.CARDS.TOTAL_COUNT);
        // Check that result contains Sprites
        expect(sprites[0]).toBeInstanceOf(Sprite);
    });

    it('should generate unique tints for cards', () => {
        // Accessing private method for a unit test logic check
        const tint1 = (generator as any).getTint(1);
        const tint2 = (generator as any).getTint(2);

        expect(tint1).not.toEqual(tint2);
        expect(typeof tint1).toBe('number');
    });

    it('should correctly generate deterministic pattern points for a seed', () => {
        const points1 = (generator as any).generatePatternPoints(123, 100, 200);
        const points2 = (generator as any).generatePatternPoints(123, 100, 200);
        const points3 = (generator as any).generatePatternPoints(456, 100, 200);

        // Same seed = same points
        expect(points1).toEqual(points2);
        // Different seed = different points
        expect(points1).not.toEqual(points3);
        // Correct count
        expect(points1.length).toBe(GameConfig.CARDS.VORONOI_POINT_COUNT);
    });
});