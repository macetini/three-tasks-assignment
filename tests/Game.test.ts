import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    app: {
        init: vi.fn().mockResolvedValue(undefined),
        canvas: document.createElement('canvas'),
        stage: { addChild: vi.fn() },
        ticker: { add: vi.fn() }
    }
}));

vi.mock('pixi.js', async () => {
    const actual = await vi.importActual('pixi.js');
    return {
        ...actual,
        Application: vi.fn().mockImplementation(function() {
            return mocks.app;
        })
    };
});

import { GameContext } from '../src/core/context/GameContext';
import { Game } from '../src/main';

describe('Game Entry Point', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Mock GameContext.bootstrap
        vi.spyOn(GameContext.prototype, 'bootstrap').mockResolvedValue(undefined);
        // Prepare DOM
        document.body.innerHTML = '<div id="game-container"></div>';
    });

    it('should initialize PIXI and bootstrap the GameContext', async () => {
        const game = new Game();
        await game.init();

        // Verify PIXI was initialized
        expect(mocks.app.init).toHaveBeenCalled();
        // Verify canvas was added to the DOM
        const container = document.getElementById('game-container');
        expect(container?.contains(mocks.app.canvas)).toBe(true);
        // Verify the MVCS context was bootstrapped
        expect(GameContext.prototype.bootstrap).toHaveBeenCalled();
    });

    it('should setup global error handlers', async () => {
        const game = new Game();
        await game.init();

        expect(globalThis.window.onerror).toBeDefined();
        expect(globalThis.window.onunhandledrejection).toBeDefined();
    });
});