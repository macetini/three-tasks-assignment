// tests/core/mvcs/view/components/PhoenixFlameView.test.ts
import { Texture } from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PhoenixFlameView } from '../../../../../src/core/mvcs/view/components/PhoenixFlameView';

describe('PhoenixFlameView', () => {
    let view: PhoenixFlameView;
    let mockTexture: Texture;

    beforeEach(() => {
        vi.restoreAllMocks();
        view = new PhoenixFlameView();
        // Mock texture for v8 Particle
        mockTexture = {
            destroy: vi.fn(),
            _source: {}, // v8 internal check
            valid: true
        } as any;
        view.init();
    });

    it('should initialize and register pointer events', () => {
        const onSpy = vi.spyOn(view, 'on');
        view.init();
        expect(onSpy).toHaveBeenCalledWith('pointermove', expect.any(Function), view);
        expect(onSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function), view);
        expect(view.eventMode).toBe('static');
    });

    it('should use ParticleContainer for rendering particles', () => {
        view.setupFlameParticleEmitter(mockTexture);

        // In v8, we only expect 1 child (the ParticleContainer)
        // TaskView might have other children like the back button, 
        // but the particles themselves are NOT direct children.
        const container = (view as any).particleContainer;
        expect(container).toBeDefined();
        expect(container.isRenderGroup).toBe(true);
    });

    it('should create the correct number of particle warpers', () => {
        view.setupFlameParticleEmitter(mockTexture);
        const warpers = (view as any).particlesWarper;

        expect(warpers.length).toBe((view as any).cfg.MAX_PARTICLES);
    });

    it('should update particle properties based on delta', () => {
        view.setupFlameParticleEmitter(mockTexture);
        const warper = (view as any).particlesWarper[0];

        const initialY = warper.item.y;
        const initialLife = warper.life;

        // Simulate one frame update (~60fps)
        view.update(16);

        expect(warper.life).toBeLessThan(initialLife);
        expect(warper.item.y).toBeLessThan(initialY); // Moves UP
        // Check v8 scale property
        expect(warper.item.scaleX).not.toBe(0);
    });

    it('should reset particle when life reaches zero', () => {
        view.setupFlameParticleEmitter(mockTexture);
        const warper = (view as any).particlesWarper[0];

        // Force particle to "die"
        warper.life = 0;
        view.update(1);

        expect(warper.life).toBe(1); // Reset back to full life
    });

    it('should update emitter position via pointer events', () => {
        const mockEvent = {
            getLocalPosition: vi.fn((_target, point) => {
                point.set(500, 500);
            })
        };

        (view as any).onPointerHandler(mockEvent);

        expect((view as any).emitterPos.x).toBe(500);
        expect((view as any).emitterPos.y).toBe(500);
    });

    it('should cleanup on dispose', () => {
        const offSpy = vi.spyOn(view, 'off');
        view.dispose();

        expect(offSpy).toHaveBeenCalled();
        expect((view as any).particlesWarper.length).toBe(0);
    });
});