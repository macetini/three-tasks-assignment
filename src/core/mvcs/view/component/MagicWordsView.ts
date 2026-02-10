import { Container, Text } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class MagicWordsView extends AbstractView {
    public static readonly BACK_CLICK_EVENT = 'BACK_CLICK_EVENT';

    private readonly contentContainer = new Container();

    public override init(): void {
        super.init();
        this.addChild(this.contentContainer);
        this.createBackButton();
    }

    public override layout(width: number, height: number): void {
        this.contentContainer.position.set(width * 0.5, height * 0.5);
        // Additional responsive scaling logic here [cite: 17]
    }

    private createBackButton(): void {
        const backBtn = new Text({
            text: '◀ BACK',
            style: { fill: 0xffffff, fontSize: 24 }
        });
        backBtn.interactive = true;
        backBtn.cursor = 'pointer';
        backBtn.position.set(30, 30);
        backBtn.on('pointerdown', () => this.emit(MagicWordsView.BACK_CLICK_EVENT));
        this.addChild(backBtn);
    }

    /**
     * This will be called by the mediator once data is fetched [cite: 10, 11]
     */
    public displayDialogue(content: any[]): void {
        // We will implement the Rich Text rendering logic here next
        console.log("[MagicWordsView] Displaying dialogue data", content);
    }
}