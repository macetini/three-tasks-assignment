import { Container } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class MagicWordsView extends AbstractView {
    private readonly contentContainer = new Container();

    public override init(): void {
        super.init();
        this.addChild(this.contentContainer);        
    }

    public override layout(width: number, height: number): void {
        this.contentContainer.position.set(width * 0.5, height * 0.5);
        // Additional responsive scaling logic here [cite: 17]
    }    

    /**
     * This will be called by the mediator once data is fetched [cite: 10, 11]
     */
    public displayDialogue(content: any[]): void {
        // We will implement the Rich Text rendering logic here next
        console.debug("[MagicWordsView] Displaying dialogue data", content);
    }
}