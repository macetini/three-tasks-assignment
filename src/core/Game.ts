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
            width: window.innerWidth,
            height: window.innerHeight,
            autoDensity: true,
            antialias: true,
            backgroundColor: 0x1099bb

        });
        this.app.canvas.className = styles.gameCanvas;
        document.body.appendChild(this.app.canvas);

        const gameContext = new GameContext(this.app);
        gameContext.bootstrap();

        this.addDebugInfo();
    }

    private addDebugInfo(): void {
        // TODO - read text from localization files
        const textTemplate = "FPS: %1";
        const fpsText: Text = new Text({ text: textTemplate.replace("%1", "0"), style: { fill: 0xffffff, fontSize: 16 } });
        fpsText.x = fpsText.y = 10;
        this.app.stage.addChild(fpsText);

        this.app.ticker.add(() => {
            const currentText = textTemplate.replace("%1", Math.round(this.app.ticker.FPS).toString());
            fpsText.text = currentText;
        });
    }
}