import { describe, test, expect, beforeEach } from '@jest/globals';
import { Container, Sprite } from 'pixi.js';
import { AceOfShadowsView } from '../src/core/mvcs/view/components/AceOfShadowsView';

describe('AceOfShadowsView', () => {
    let view: AceOfShadowsView;

    beforeEach(() => {
        // We cast to any because our Mock doesn't implement 100% of Pixi's private types
        view = new AceOfShadowsView() as any;
        view.init();
    });

    test('should transfer card between stacks', () => {
        const stackA = new Container();
        const stackB = new Container();
        const card = new Sprite();

        stackA.addChild(card);
        expect(stackA.children.length).toBe(1);

        // Execute logic
        view.moveTopCardToTargetStack(stackA as any, stackB as any);

        // Per your view logic, card moves from origin stack to animationLayer
        expect(stackA.children.length).toBe(0);
    });
});