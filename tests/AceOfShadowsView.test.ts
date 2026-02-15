import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { gsap } from 'gsap';
import { Container, Sprite } from 'pixi.js';
import { AceOfShadowsView } from '../src/core/mvcs/view/components/AceOfShadowsView';

describe('AceOfShadowsView', () => {
    let view: AceOfShadowsView;

    beforeEach(() => {
        jest.clearAllMocks();
        view = new AceOfShadowsView() as any;
        view.init();
    });

    test('should transfer card between stacks', () => {
        const stackA = new Container();
        const stackB = new Container();
        const card = new Sprite();

        stackA.addChild(card);
        expect(stackA.children.length).toBe(1);

        view.moveTopCardToTargetStack(stackA as any, stackB as any);

        // Verify it was removed from source
        expect(stackA.children.length).toBe(0);
        // Verify it is currently in the animation layer (middle of move)
        expect(view['animationLayer'].children).toContain(card);
    });

    test('stopStackingSequence should clear references and kill tweens', () => {
        const card = new Sprite();

        // Populate with one card
        view.populateStack([card]);
        expect(view['cards'].length).toBe(1);

        // Stop the sequence
        view.stopStackingSequence();

        // Verify cleanup
        expect(view['cards'].length).toBe(0);

        // Verify gsap.killTweensOf was called
        expect(gsap.killTweensOf).toHaveBeenCalledWith(card);
    });

    test('populateStack should add all cards to internal tracking', () => {
        const cards = [new Sprite(), new Sprite(), new Sprite()];

        view.populateStack(cards);

        expect(view['stackA'].children.length).toBe(3);
        expect(view['cards'].length).toBe(3);
    });

    test('moveTopCardToTargetStack should return early if stack is empty', () => {
        const stackA = new Container();
        const stackB = new Container();

        // This should not throw any errors
        expect(() => {
            view.moveTopCardToTargetStack(stackA, stackB);
        }).not.toThrow();
    });
});