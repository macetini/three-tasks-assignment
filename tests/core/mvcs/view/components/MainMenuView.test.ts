import { gsap } from 'gsap';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MainMenuView } from '../../../../../src/core/mvcs/view/components/MainMenuView';
import { TaskSignals } from '../../../../../src/core/signal/TaskSignals';

describe('MainMenuView', () => {
    let view: MainMenuView;

    beforeEach(() => {
        vi.restoreAllMocks();
        view = new MainMenuView();
        // Trigger button creation
        view.onAddedToRoot();
    });

    it('should create three navigation buttons', () => {
        // Based on onAddedToRoot logic
        const buttons = (view as any).buttons;
        expect(buttons.length).toBe(3);
    });

    it('should emit MENU_CLICK_EVENT with correct task type when a button is clicked', () => {
        const emitSpy = vi.spyOn(view, 'emit');
        const buttons = (view as any).buttons;

        // Button 0 is Ace of Shadows (TaskSignals.CARDS)
        buttons[0].emit('pointertap');

        expect(emitSpy).toHaveBeenCalledWith(
            MainMenuView.MENU_CLICK_EVENT,
            TaskSignals.CARDS
        );
    });

    it('should trigger staggered entrance animation on layout', () => {
        const timelineSpy = vi.spyOn(gsap, 'timeline');

        // Layout triggers playStaggeredEntrance
        view.layout(1920, 1080);

        expect(timelineSpy).toHaveBeenCalled();
        const timeline = (view as any).entranceTimeline;
        expect(timeline.to).toHaveBeenCalledWith(
            (view as any).buttons,
            expect.objectContaining({
                stagger: 0.1,
                ease: "back.out(1.7)"
            })
        );
    });

    it('should kill existing timeline if layout is called again', () => {
        view.layout(1000, 1000);
        const firstTimeline = (view as any).entranceTimeline;
        vi.spyOn(firstTimeline, 'kill');

        view.layout(800, 600);

        expect(firstTimeline.kill).toHaveBeenCalled();
    });
});