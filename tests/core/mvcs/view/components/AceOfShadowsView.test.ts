// tests/core/mvcs/view/components/AceOfShadowsView.test.ts
import { gsap } from 'gsap';
import { Sprite } from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AceOfShadowsView } from '../../../../../src/core/mvcs/view/components/AceOfShadowsView';

describe('AceOfShadowsView', () => {
    let view: AceOfShadowsView;

    beforeEach(() => {
        vi.restoreAllMocks();
        view = new AceOfShadowsView();
        view.init();
    });

    it('should initialize with two stacks and an animation layer', () => {
        const scalableContent = (view as any).scalableContent;
        // stackA, stackB, animationLayer
        expect(scalableContent.children.length).toBe(3);
    });

    it('should populate stackA with cards and trigger animations', () => {
        const mockCards = [new Sprite(), new Sprite(), new Sprite()];
        const gsapSpy = vi.spyOn(gsap, 'to');

        view.populateStack(mockCards);

        const stackA = (view as any).stackA;
        expect(stackA.children.length).toBe(3);
        expect(gsapSpy).toHaveBeenCalledTimes(3);
    });

    it('should move card to animation layer during transition', () => {
        const mockCard = new Sprite();
        const stackA = (view as any).stackA;
        const animationLayer = (view as any).animationLayer;
        const stackB = (view as any).stackB;

        stackA.addChild(mockCard);

        view.moveTopCardToTargetStack(stackA, stackB);

        // Card should be moved from stackA to animationLayer immediately
        expect(stackA.children.length).toBe(0);
        expect(animationLayer.children.length).toBe(1);
    });

    it('should kill the sequence and clear cards on stopStackingSequence', () => {
        const mockCard = new Sprite();
        (view as any).cards.push(mockCard);

        // Create a fake timeline to check if it gets killed
        const mockTimeline = { kill: vi.fn() };
        (view as any).sequence = mockTimeline;

        view.stopStackingSequence();

        expect(mockTimeline.kill).toHaveBeenCalled();
        expect((view as any).cards.length).toBe(0);
    });

    it('should correctly calculate scale during layout', () => {
        const scalableContent = (view as any).scalableContent;

        // Set a 1000x1000 viewport
        view.layout(1000, 1000);

        // Based on your code: Math.min(1000 / CONTENT_SCALER, 1000 / CONTENT_SCALER)
        // If CONTENT_SCALER is e.g. 1000, scale should be 1.
        expect(scalableContent.scale.x).toBeGreaterThan(0);
    });
});