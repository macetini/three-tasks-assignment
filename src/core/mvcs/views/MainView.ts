import { Container, Text, Graphics } from 'pixi.js';

export class MainView extends Container {
    private readonly onTaskSelected: (taskId: number) => void;

    constructor(onTaskSelected: (taskId: number) => void) {
        super();
        this.onTaskSelected = onTaskSelected;
        this.setupMenu();
    }

    private setupMenu(): void {
        const title = new Text({
            text: "THREE TASKS CHALLENGE",
            style: { fill: 0xffffff, fontSize: 36, fontWeight: 'bold' }
        });
        title.anchor.set(0.5);
        title.y = -150;
        this.addChild(title);

        // Task Buttons
        this.createButton("1. Ace of Shadows", 0, () => this.onTaskSelected(1));
        this.createButton("2. Magic Words", 80, () => this.onTaskSelected(2));
        this.createButton("3. Phoenix Flame", 160, () => this.onTaskSelected(3));
    }

    private createButton(label: string, yOffset: number, callback: () => void): void {
        const container = new Container();
        container.y = yOffset;

        const bg = new Graphics()
            .roundRect(-150, -25, 300, 50, 10)
            .fill({ color: 0x2c3e50 });

        const txt = new Text({
            text: label,
            style: { fill: 0xffffff, fontSize: 20 }
        });
        txt.anchor.set(0.5);

        container.addChild(bg, txt);

        // Interactivity
        container.eventMode = 'static';
        container.cursor = 'pointer';
        container.on('pointerover', () => bg.alpha = 0.8);
        container.on('pointerout', () => bg.alpha = 1.0);
        container.on('pointertap', callback);

        this.addChild(container);
    }

    /**
     * Centers the menu whenever the screen resizes
     */
    public resize(width: number, height: number): void {
        this.x = width / 2;
        this.y = height / 2;
    }
}