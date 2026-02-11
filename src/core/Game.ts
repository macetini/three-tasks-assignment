import { Application } from 'pixi.js';
import styles from '../style/game.module.css';
import { GameContext } from './context/GameContext';

export class Game {
    private readonly app: Application;
    private readonly gameContext: GameContext;

    constructor() {
        this.app = new Application();
        this.gameContext = new GameContext(this.app);
    }

    public async init(): Promise<void> {
        console.log("[Game] Init Started.");

        globalThis.window.onerror = (msg, url, line, col, err) =>
            console.error("[Global Error]", msg, url, line, col, err);

        globalThis.window.onunhandledrejection = (e) =>
            console.error("[Unhandled Promise Rejection]", e.reason);

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