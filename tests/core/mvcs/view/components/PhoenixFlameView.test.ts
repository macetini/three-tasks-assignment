// tests/core/mvcs/view/components/PhoenixFlameView.test.ts
import { Rectangle, Texture } from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PhoenixFlameView } from '../../../../../src/core/mvcs/view/components/PhoenixFlameView';

describe('PhoenixFlameView', () => {
    let view: PhoenixFlameView;
    let mockTexture: Texture;

    beforeEach(() => {
        vi.restoreAllMocks();
        view = new PhoenixFlameView();
        mockTexture = { destroy: vi.fn() } as any;
        view.init();
    });

    it('should initialize and register pointer events', () => {
        const onSpy = vi.spyOn(view, 'on');
        view.init();
        expect(onSpy).toHaveBeenCalledWith('pointermove', expect.any(Function), view);
        expect(onSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function), view);
        expect(view.eventMode).toBe('static');
    });

    it('should create the correct number of particles during setupFire', () => {
        view.setupFire(mockTexture);
        const particles = (view as any).particles;
        // Check against your GameConfig.FLAME.MAX_PARTICLES (usually 10)
        expect(particles.length).toBe((view as any).cfg.MAX_PARTICLES);
        // Check actual children (10) + back button (1) = 11
        expect(view.children.length).toBe((view as any).cfg.MAX_PARTICLES + 1);
    });

    it('should update particle properties based on delta', () => {
        view.setupFire(mockTexture);
        const particle = (view as any).particles[0];
        const initialY = particle.sprite.y;
        const initialLife = particle.life;

        // Simulate one frame update
        view.update(16); // ~60fps delta

        expect(particle.life).toBeLessThan(initialLife);
        expect(particle.sprite.y).toBeLessThan(initialY); // Particles move UP (decreasing Y)
        expect(particle.sprite.scale.x).not.toBe(0);
    });

    it('should reset particle when life reaches zero', () => {
        view.setupFire(mockTexture);
        const particle = (view as any).particles[0];

        // Force particle to "die"
        particle.life = 0;
        // One update cycle should trigger reset
        view.update(1);

        expect(particle.life).toBe(1); // Reset back to full life
    });

    it('should update emitter position via pointer events', () => {
        view.setupFire(mockTexture);

        const mockEvent = {
            getLocalPosition: vi.fn((_target, point) => {
                point.set(500, 500);
            })
        };

        (view as any).onPointerHandler(mockEvent);

        expect((view as any).emitterPos.x).toBe(500);
        expect((view as any).emitterPos.y).toBe(500);
    });

    it('should set hitArea and default position during layout', () => {
        view.layout(1000, 1000);

        expect(view.hitArea).toBeInstanceOf(Rectangle);
        expect((view as any).emitterPos.y).toBe(850); // 85% of 1000
    });

    it('should cleanup on dispose', () => {
        const offSpy = vi.spyOn(view, 'off');
        view.dispose();

        expect(offSpy).toHaveBeenCalled();
        expect((view as any).particles.length).toBe(0);
    });
});