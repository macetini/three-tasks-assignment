import * as PIXI from 'pixi.js';
//import styles from '../style/game.module.css';
import { GameContext } from './context/GameContext';

export class Game {
    private readonly app: PIXI.Application;
    private readonly gameContext: GameContext;

    constructor() {
        this.app = new PIXI.Application();
        this.gameContext = new GameContext(this.app);
    }

    public async init(): Promise<void> {
        console.log("[Game] Init Started NEW.");

        try {
            await this.app.init({
                // Explicitly use a color number, not a string, for background
                background: 0xF00015,
                width: 800,
                height: 600,
                antialias: true,
                // Force a specific preference if WebGPU is acting up on GitHub's environment
                preference: 'webgl'
            });

            console.log("[Game] Pixi App Initialized."); // NEW LOG

            document.body.appendChild(this.app.canvas);
            console.log("[Game] Canvas Appended."); // NEW LOG

            this.gameContext.bootstrap();
            console.log("[Game] Bootstrap Called."); // NEW LOG

        } catch (e) {
            console.error("[Game] Init/Bootstrap Critical Error:", e);
        }

        console.log("[Game] Init Finished.");
    }

    public async init_old(): Promise<void> {
        console.log("[Game] Init Started.");
        // Initialize with responsive settings
        await this.app.init({
            background: '#F00015',
            width: 800,
            height: 600,
            antialias: true
        });

        /*await this.app.init({
            resizeTo: globalThis.window,
            autoDensity: true,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            backgroundColor: 0x1099bb

        });*/
        //this.app.canvas.className = styles.gameCanvas;
        //const gameContainer = document.getElementById('game-container') || document.body;
        //gameContainer.appendChild(this.app.canvas);

        document.body.appendChild(this.app.canvas);
        try {
            this.gameContext.bootstrap();
        } catch (e) {
            console.error("[Game] Bootstrap Failed:", e);
        }
        //this.addDebugInfo();
        console.log("[Game] Init Finished.");
    }

    /*
    private addDebugInfo(): void {
        const textTemplate = "FPS: %1 Avg: %2";
        const fpsText: PIXI.Text = new PIXI.Text({
            text: textTemplate.replace("%1", "0").replace("%2", "0"),
            style: { fill: 0xffffff, fontSize: 16, fontWeight: 'bold' }
        });

        fpsText.x = fpsText.y = 10;
        this.app.stage.addChild(fpsText);

        const samples: number[] = [];
        const maxSamples = 60;

        this.app.ticker.add(() => {
            const currentFPS = this.app.ticker.FPS;

            samples.push(currentFPS);
            if (samples.length > maxSamples) {
                samples.shift(); // Remove oldest
            }

            const sum = samples.reduce((a, b) => a + b, 0);
            const avgFPS = Math.round(sum / samples.length);

            fpsText.text = textTemplate
                .replace("%1", Math.round(currentFPS).toString())
                .replace("%2", avgFPS.toString());

            if (currentFPS < 20) fpsText.style.fill = 0xff4444; // Red
            else if (currentFPS < 40) fpsText.style.fill = 0xffaa00; // Orange
            else fpsText.style.fill = 0x00ff00; // Green
        });
    }
        */
}