import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MainMenuView } from '../../../../../src/core/mvcs/view/components/MainMenuView';
import { MainMenuMediator } from '../../../../../src/core/mvcs/view/mediators/MainMenuMediator';
import { ModelSignals } from '../../../../../src/core/signal/ModelSignals';

describe('MainMenuMediator', () => {
    let mediator: MainMenuMediator;
    let mockView: MainMenuView;
    let mockSignalBus: any;

    beforeEach(() => {
        mockView = new MainMenuView();
        // Since onMenuClick is a private readonly arrow function, 
        // we test it by triggering the event it listens to.
        vi.spyOn(mockView, 'on');
        vi.spyOn(mockView, 'off');

        mockSignalBus = { emit: vi.fn() };

        mediator = new MainMenuMediator(mockView);
        (mediator as any).view = mockView;
        (mediator as any).signalBus = mockSignalBus;
    });

    it('should register for MENU_CLICK_EVENT on register', () => {
        mediator.onRegister();
        expect(mockView.on).toHaveBeenCalledWith(
            MainMenuView.MENU_CLICK_EVENT,
            expect.any(Function)
        );
    });

    it('should emit SWITCH_TASK when view emits MENU_CLICK_EVENT', () => {
        mediator.onRegister();

        // Simulate the view clicking a button
        const taskType = 'test_task';
        mockView.emit(MainMenuView.MENU_CLICK_EVENT, taskType);

        expect(mockSignalBus.emit).toHaveBeenCalledWith(ModelSignals.SWITCH_TASK, taskType);
    });

    it('should validate layout dimensions correctly', () => {
        // Mock global window height for the sanity check
        const originalInnerHeight = window.innerHeight;
        (globalThis as any).innerHeight = 1000;

        const isLayoutValid = (mediator as any).isLayoutValid.bind(mediator);

        // Valid
        expect(isLayoutValid(1920, 1080)).toBe(true);

        // Invalid: Negative
        expect(isLayoutValid(-10, 500)).toBe(false);

        // Invalid: Impossible height ( > 1.5 * innerHeight)
        expect(isLayoutValid(1920, 2000)).toBe(false);

        window.innerHeight = originalInnerHeight;
    });

    it('should clean up listeners on remove', () => {
        mediator.onRemove();
        expect(mockView.off).toHaveBeenCalledWith(
            MainMenuView.MENU_CLICK_EVENT,
            expect.any(Function)
        );
    });
});