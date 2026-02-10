// src/core/mvcs/view/component/MainMenuView.ts
import { Container, Graphics, Text } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class MainMenuView extends AbstractView {
    // We'll expose these so the Mediator can listen to them
    public readonly btnTask1 = new Container();
    public readonly btnTask2 = new Container();
    public readonly btnTask3 = new Container();

    public override init(): void {
        const buttonWidth = 120;
        const spacing = 20;

        // Create 3 buttons
        this.createButton(this.btnTask1, "CARDS", 0);
        this.createButton(this.btnTask2, "FIRE", 1);
        this.createButton(this.btnTask3, "SLOT", 2);

        // Position the menu at the top center
        this.x = 400; // Assuming 800 width, or handle in resize
        this.y = 40;
    }

    private createButton(container: Container, label: string, index: number): void {
        const bg = new Graphics()
            .roundRect(-60, -20, 120, 40, 8)
            .fill({ color: 0x333333, alpha: 0.8 })
            .stroke({ width: 2, color: 0xffffff });

        const txt = new Text({
            text: label,
            style: { fill: 0xffffff, fontSize: 14, fontWeight: 'bold' }
        });
        txt.anchor.set(0.5);

        container.addChild(bg, txt);
        container.x = (index - 1) * 140; // Spread them out

        // Make interactive
        container.interactive = true;
        container.cursor = 'pointer';

        this.addChild(container);
    }
}