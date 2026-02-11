// src/core/mvcs/view/component/MainMenuView.ts
import { Container, Graphics, Text } from 'pixi.js';
import { AbstractView } from '../AbstractView';
import { GameConfig } from '../../../config/GameConfig';

export class MainMenuView extends AbstractView {
    public static readonly MENU_CLICK_EVENT = 'menu_click_event';

    private readonly cfg = GameConfig.MAIN;
    private readonly buttons: Container[] = [];

    public init(): void {
        this.addButton("ACE OF SHADOWS", "CARDS");
        this.addButton("MAGIC WORDS", "WORDS");
        this.addButton("PHOENIX FLAME", "FLAME");
    }

    private addButton(label: string, taskType: string): void {
        const button = new Container();
        button.cursor = 'pointer';
        button.eventMode = 'static';
        button.visible = button.interactive = false;

        const bg = new Graphics()
            .roundRect(0, 0, this.cfg.BUTTON_WIDTH, this.cfg.BUTTON_HEIGHT, 8)
            .fill({ color: 0x222222, alpha: 0.8 });

        const btnTxt = new Text({
            text: label,
            style: { fill: 0xffffff, fontSize: 16, fontWeight: 'bold' }
        });
        btnTxt.anchor.set(0.5);
        btnTxt.position.set(120, 25);

        button.addChild(bg, btnTxt);

        button.on('pointertap', () => {
            this.emit(MainMenuView.MENU_CLICK_EVENT, taskType);
        });

        this.addChild(button);
        this.buttons.push(button);
    }

    /**
    * Aligns buttons vertically and centers the entire menu within 
    * the provided dimensions.
    * 
    * @param width The current width of the Pixi screen
    * @param height The current height of the Pixi screen
    */
    public override layout(width: number, height: number): void {
        let totalHeight = 0;
        this.buttons.forEach((button, index) => {
            // Center buttons horizontally relative to this view's (0,0)
            button.x = -this.cfg.BUTTON_WIDTH * 0.5;
            button.y = index * (this.cfg.BUTTON_HEIGHT + this.cfg.BUTTON_GAP);
            totalHeight = button.y + this.cfg.BUTTON_HEIGHT;
            button.visible = button.interactive = true;
        });

        // Center whole menu
        this.y = height * 0.5 - totalHeight * 0.5;
        this.x = width * 0.5;

        console.debug(`[MainMenuView] Using responsive layout. View positioned at (${this.x}, ${this.y})`);
    }
}