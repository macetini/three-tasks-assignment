// tests/core/mvcs/view/components/MagicWordsView.test.ts
import { gsap } from 'gsap';
import { Container, Text } from 'pixi.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MagicWordVO } from '../../../../../src/core/mvcs/model/states/vo/MagicWordVO';
import { MagicWordsView } from '../../../../../src/core/mvcs/view/components/MagicWordsView';

describe('MagicWordsView', () => {
    let view: MagicWordsView;

    beforeEach(() => {
        vi.restoreAllMocks();
        view = new MagicWordsView();
        view.init();
    });

    afterEach(() => {
        view.dispose();
    });

    it('should initialize with loading text and chat container', () => {
        // chatContainer added at 0, loadingText added after
        expect(view.children.length).toBeGreaterThanOrEqual(2);
        expect(view.children[0]).toBeInstanceOf(Container);
        expect(view.children[1]).toBeInstanceOf(Text);
    });

    it('should toggle loading text visibility', () => {
        view.showLoading();
        expect((view as any).loadingText.visible).toBe(true);

        view.hideLoading();
        expect((view as any).loadingText.visible).toBe(false);
    });

    describe('Scrolling Logic', () => {
        it('should scroll down when ArrowDown is pressed', () => {
            const initialY = (view as any).chatContainer.y;

            // Simulate Keyboard Event
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            globalThis.dispatchEvent(event);

            // In applyScroll, ArrowDown applies -SCROLL_STEP
            expect((view as any).chatContainer.y).toBeLessThan(initialY + 1);
        });

        it('should scroll via mouse wheel', () => {
            const initialY = (view as any).chatContainer.y;

            // Simulate Pixi Wheel Event
            view.emit('wheel', { deltaY: -100 } as any);

            expect((view as any).chatContainer.y).not.toBe(initialY);
        });

        it('should clamp scrolling within boundaries', () => {
            // Force a massive scroll up
            (view as any).applyScroll(10000);
            // Should be capped by MAX_SCROLL_HEIGHT (from GameConfig)
            expect((view as any).chatContainer.y).toBeLessThanOrEqual(500);
        });
    });

    describe('Row Management', () => {
        it('should build rows from VOs', () => {
            const mockWords = [
                new MagicWordVO('Hero', 'Msg 1'),
                new MagicWordVO('Villain', 'Msg 2')
            ];
            const options = {
                textureProvider: vi.fn().mockReturnValue({}),
                positionProvider: vi.fn().mockReturnValue('left')
            };

            view.buildRows(mockWords, options);

            const chatContainer = (view as any).chatContainer;
            expect(chatContainer.children.length).toBe(2);
            expect((view as any).chatRows.length).toBe(2);
        });

        it('should destroy old rows when building new ones', () => {
            const options = {
                textureProvider: vi.fn().mockReturnValue({}),
                positionProvider: vi.fn().mockReturnValue('left')
            };

            view.buildRows([new MagicWordVO('A', '1')], options);
            const firstChild = (view as any).chatContainer.children[0];
            const destroySpy = vi.spyOn(firstChild, 'destroy');

            // Rebuild
            view.buildRows([new MagicWordVO('B', '2')], options);
            expect(destroySpy).toHaveBeenCalled();
        });
    });

    it('should trigger GSAP animation on playChatEntrance', () => {
        view.playChatEntrance();
        expect(gsap.to).toHaveBeenCalledWith(
            expect.any(Array),
            expect.objectContaining({ stagger: expect.any(Number) })
        );
    });

    it('should clean up listeners on dispose', () => {
        const removeSpy = vi.spyOn(globalThis, 'removeEventListener');
        view.dispose();
        expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
});