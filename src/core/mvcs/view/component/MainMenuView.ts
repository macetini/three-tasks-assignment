// src/core/mvcs/view/component/MainMenuView.ts
import { Container, Graphics, Text } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class MainMenuView extends AbstractView {
    private readonly BUTTON_GAP = 15;
    private readonly BUTTON_W: number = 240;
    private readonly BUTTON_H: number = 50;

    private readonly _buttons: Container[] = [];

    public init(): void {
        this.createButton("ACE OF SHADOWS", "CARDS");
        this.createButton("MAGIC FIRE", "FIRE");
        this.createButton("SCALES", "SLOT");
    }

    private createButton(label: string, taskType: string): void {
        const btn = new Container();
        btn.cursor = 'pointer';
        btn.eventMode = 'static';

        const bg = new Graphics()
            .roundRect(0, 0, 240, 50, 8)
            .fill({ color: 0x222222, alpha: 0.8 });

        const txt = new Text({
            text: label,
            style: { fill: 0xffffff, fontSize: 16, fontWeight: 'bold' }
        });
        txt.anchor.set(0.5);
        txt.position.set(120, 25);

        btn.addChild(bg, txt);

        btn.on('pointertap', () => {
            //this.dispatchEvent(new CustomEvent('MENU_CLICK', { detail: taskType }));
        });

        this.addChild(btn);
        this._buttons.push(btn);
    }

    /**
    * Aligns buttons vertically and centers the entire menu within 
    * the provided dimensions.
    * 
    * @param width The current width of the Pixi screen
    * @param height The current height of the Pixi screen
    */
    public layout(width: number, height: number): void {
        let totalHeight = 0;
        this._buttons.forEach((btn, index) => {
            // Center buttons horizontally relative to this view's (0,0)
            btn.x = -this.BUTTON_W * 0.5;
            btn.y = index * (this.BUTTON_H + this.BUTTON_GAP);
            totalHeight = btn.y + this.BUTTON_H;
        });

        // Optional: If you want the menu itself to be centered 
        // in your fixed virtual space (e.g. 1000px height)
        this.y = height * 0.5 - totalHeight * 0.5;
        this.x = width * 0.5;
    }
}