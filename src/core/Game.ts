import { Application, Text } from 'pixi.js';
import styles from '../style/game.module.css';
import { GameContext } from './context/GameContext';

export class Game {
    private readonly app: Application;

    constructor() {
        this.app = new Application();
    }

    async init(): Promise<void> {
        // Initialize with responsive settings
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
        //document.body.appendChild(this.app.canvas);

        const gameContext = new GameContext(this.app);
        gameContext.bootstrap();

        this.addDebugInfo();
    }

    private addDebugInfo(): void {
        const textTemplate = "FPS: %1 Avg: %2";
        const fpsText: Text = new Text({
            text: textTemplate.replace("%1", "0").replace("%2", "0"),
            style: { fill: 0xffffff, fontSize: 16, fontWeight: 'bold' }
        });

        fpsText.x = fpsText.y = 10;
        this.app.stage.addChild(fpsText);

        const samples: number[] = [];
        const maxSamples = 60;

        this.app.ticker.add(() => {
            const currentFPS = this.app.ticker.FPS;

            // 1. Update rolling buffer
            samples.push(currentFPS);
            if (samples.length > maxSamples) {
                samples.shift(); // Remove oldest
            }

            // 2. Calculate average
            const sum = samples.reduce((a, b) => a + b, 0);
            const avgFPS = Math.round(sum / samples.length);

            // 3. Update text (using single replace chain for speed)
            fpsText.text = textTemplate
                .replace("%1", Math.round(currentFPS).toString())
                .replace("%2", avgFPS.toString());

            // OPTIMIZATION: Color code the FPS for quick visual debugging
            if (currentFPS < 30) fpsText.style.fill = 0xff4444; // Red
            else if (currentFPS < 55) fpsText.style.fill = 0xffaa00; // Orange
            else fpsText.style.fill = 0x00ff00; // Green
        });
    }
}