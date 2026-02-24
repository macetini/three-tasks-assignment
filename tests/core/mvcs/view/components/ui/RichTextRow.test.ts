import { Container, Graphics, Sprite } from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MagicWordVO } from '../../../../../../src/core/mvcs/model/states/vo/MagicWordVO';
import { RichTextRow } from '../../../../../../src/core/mvcs/view/components/ui/RichTextRow';

describe('RichTextRow', () => {
    let realVO: MagicWordVO;
    let mockTextureProvider: any;

    beforeEach(() => {
        vi.restoreAllMocks();

        realVO = new MagicWordVO('Hero', 'Hello {smile} world');
        mockTextureProvider = vi.fn().mockReturnValue({ destroy: vi.fn() });
    });

    it('should initialize with an avatar, background, and text container', () => {
        const row = new RichTextRow(realVO, 'left', mockTextureProvider);

        expect(row.children.length).toBe(3);
        expect(row.children[0]).toBeInstanceOf(Graphics); // background
        expect(row.children[1]).toBeInstanceOf(Sprite);   // avatar
        expect(row.children[2]).toBeInstanceOf(Container); // textContainer
    });

    it('should build content and draw bubble on updateLayout', () => {
        const row = new RichTextRow(realVO, 'left', mockTextureProvider);
        const bg = (row as any).background;
        const bgSpy = vi.spyOn(bg, 'roundRect');

        row.updateLayout(1);

        // Verify drawing commands were called
        expect(bgSpy).toHaveBeenCalled();
        // Verify textContainer has the character name + tokens
        const textContainer = (row as any).textContainer;
        // 1 (Name) + 1 (Text token 'Hello') + 1 (Emoji) + 1 (Text token 'world') + 1 (Bubble) + 1 (Avatar) = 6
        expect(textContainer.children.length).toBe(6);
    });

    it('should align elements to the right when position is "right"', () => {
        const row = new RichTextRow(realVO, 'right', mockTextureProvider);
        row.updateLayout(1);

        // Mock dimensions for the internal containers                
        const avatar = (row as any).avatar;

        // In 'right' alignment, avatar should be placed near the screen edge
        // GameConfig.WORDS.MIN_SCREEN_WIDTH (usually 375 or similar) * scale - width - 1
        expect(avatar.x).toBeGreaterThan(300);
        // Background should be placed to the left of the avatar
        expect((row as any).background.x).toBeLessThan(avatar.x);
    });

    it('should wrap lines when text exceeds MAX_WIDTH', () => {
        const row = new RichTextRow(realVO, 'left', mockTextureProvider);

        // Force a wrap by providing a position near the limit
        // Assuming MAX_WIDTH is 400
        const pos = { x: 390, y: 0, scale: 1 };
        const result = (row as any).handleLineWrap(50, pos);

        expect(result.x).toBe(0);
        expect(result.y).toBeGreaterThan(0); // Jumped to next line
    });

    it('should not re-render if scale change is below threshold', () => {
        const row = new RichTextRow(realVO, 'left', mockTextureProvider);
        const drawSpy = vi.spyOn((row as any), 'drawBubble');

        row.updateLayout(1);
        expect(drawSpy).toHaveBeenCalledTimes(1);

        // Update with tiny change (0.001 < 0.01 threshold)
        row.updateLayout(1.001);
        expect(drawSpy).toHaveBeenCalledTimes(1); // Should not have called again
    });

    it('should destroy existing text rows to prevent memory leaks during layout updates', () => {
        const row = new RichTextRow(realVO, 'left', mockTextureProvider);
        row.updateLayout(1);

        const textContainer = (row as any).textContainer;
        const firstChild = textContainer.children[0];
        const destroySpy = vi.spyOn(firstChild, 'destroy');

        // Trigger a significant scale change to force re-draw
        row.updateLayout(2);

        expect(destroySpy).toHaveBeenCalledWith(expect.objectContaining({ children: true }));
    });
});