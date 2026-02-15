import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Container, Rectangle } from 'pixi.js';
import { gsap } from 'gsap';
import { MagicWordsView } from '../src/core/mvcs/view/components/MagicWordsView';

describe('MagicWordsView', () => {
    let view: MagicWordsView;

    beforeEach(() => {
        jest.clearAllMocks();
        view = new MagicWordsView() as any;
        view.init();
    });

    test('should initialize with chat container and loading text', () => {
        expect(view['chatContainer']).toBeDefined();
        expect(view['loadingText']).toBeDefined();
        expect(view['loadingText'].visible).toBe(false);
    });

    test('showLoading/hideLoading should toggle visibility correctly', () => {
        view.showLoading();
        expect(view['loadingText'].visible).toBe(true);

        view.hideLoading();
        expect(view['loadingText'].visible).toBe(false);
    });

    test('layout should set hitArea and center loading text', () => {
        const width = 800;
        const height = 600;
        view.layout(width, height);

        expect(view.hitArea).toBeInstanceOf(Rectangle);

        expect(view['loadingText'].position.x).toBe(width * 0.5);
        expect(view['loadingText'].position.y).toBe(height * 0.5);
    });

    test('applyScroll should clamp the container Y position', () => {
        const cfg = view['cfg'];

        view['chatContainer'].height = 1000;

        // 1. Test scrolling too far UP (should not exceed MAX_SCROLL_HEIGHT)
        view['applyScroll'](5000);
        expect(view['chatContainer'].y).toBeLessThanOrEqual(cfg.MAX_SCROLL_HEIGHT);

        // 2. Test scrolling too far DOWN (should not go past the bottom boundary)
        view['applyScroll'](-5000);
        const viewHeight = cfg.MIN_SCROLL_HEIGHT;
        const expectedMin = Math.min(0, viewHeight - 1000);
        expect(view['chatContainer'].y).toBeGreaterThanOrEqual(expectedMin);
    });

    test('onArrowKeyDown should trigger scroll on ArrowUp/Down', () => {
        const scrollSpy = jest.spyOn(view as any, 'applyScroll');        
        view['onArrowKeyDown']({ key: 'ArrowUp' } as KeyboardEvent);

        expect(scrollSpy).toHaveBeenCalled();
    });

    test('dispose should clean up global keyboard listeners and GSAP', () => {
        const removeEventListenerSpy = jest.spyOn(globalThis, 'removeEventListener');

        view.dispose();
        
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        
        expect(gsap.killTweensOf).toHaveBeenCalled();
    });

    test('addRow should increment the vertical offset for the next row', () => {
        const initialY = view['currentY'];
        const mockRow = new Container() as any;
        mockRow.height = 100;

        view.addRow(mockRow);

        expect(mockRow.y).toBe(initialY);
        // New currentY should be Height + Padding
        expect(view['currentY']).toBe(100 + view['cfg'].LINE_PADDING);
        expect(view['chatContainer'].children).toContain(mockRow);
    });
});