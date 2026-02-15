import * as PIXI from 'pixi.js';
import styles from './style/game.module.css';
import { GameContext } from './core/context/GameContext';

console.log('[main] Three Tasks Assignment Started');

export class Game {
    private readonly app: PIXI.Application;
    private readonly gameContext: GameContext;

    constructor() {
        this.app = new PIXI.Application();
        this.gameContext = new GameContext(this.app);
    }

    public async init(): Promise<void> {
        console.log("[Game] Init Started.");

        globalThis.window.onerror = (msg, url, line, col, err) =>
            console.error("[Game] Global Error: ", msg, url, line, col, err);

        globalThis.window.onunhandledrejection = (e) =>
            console.error("[Game] Unhandled Promise Rejection: ", e.reason);

        await this.app.init({
            resizeTo: globalThis.window,
            autoDensity: true,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            backgroundColor: 0x1099bb

        });
        this.app.canvas.className = styles.gameCanvas;
        const gameContainer = document.getElementById('game-container') || document.body;
        gameContainer.appendChild(this.app.canvas);

        this.gameContext.bootstrap();
        console.log("[Game] Init Finished.");
    }
}

const game = new Game();
game.init();

console.log('[main] Three Tasks Assignment Initialized');