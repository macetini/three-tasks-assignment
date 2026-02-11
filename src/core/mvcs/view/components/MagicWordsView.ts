import { Container } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class MagicWordsView extends AbstractView {
    private readonly chatContainer = new Container();

    public override init(): void {
        super.init();
        this.addChild(this.chatContainer);
    }

    public override layout(width: number, height: number): void {
        this.chatContainer.position.set(width * 0.5, height * 0.5);
        this.chatContainer.position.set(50, 50);
    }

    public addRow(row: Container): void {
        this.chatContainer.addChild(row);
    }
}