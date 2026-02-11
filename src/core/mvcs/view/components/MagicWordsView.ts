import { Container, Texture } from 'pixi.js';
import type { AvatarPosition } from '../../model/states/MagicWordsModel';
import type { MagicWordVO } from '../../model/states/vo/MagicWordVO';
import { AbstractView } from '../AbstractView';
import { RichTextRow } from './ui/RichTextRow';

export class MagicWordsView extends AbstractView {
    private readonly chatContainer = new Container();

    private currentY: number = 0;

    public override init(): void {
        super.init();
        this.addChild(this.chatContainer);
    }

    public override layout(width: number, height: number): void {
        this.chatContainer.position.set(width * 0.5 - this.chatContainer.width * 0.5, 75);

        if (width <= 400) return;
        let scale = Math.min(width / 400, height / 400);
        if (scale > 1) scale = 1;
        this.chatContainer.scale.set(scale);
    }

    public buildRows(
        words: MagicWordVO[],
        options: {
            textureProvider: (id: string) => Texture,
            positionProvider: (name: string) => AvatarPosition
        }
    ): void {
        if (words.length === 0) {
            console.warn("[MagicWordsView] New chat Words count is 0. Skipping.");
            return
        }

        this.chatContainer.removeChildren();

        words.forEach((wordsRow) => {
            const position = options.positionProvider(wordsRow.characterName);
            const textRow = new RichTextRow(wordsRow, position, options.textureProvider);
            this.addRow(textRow);
        });
    }

    public addRow(wordsRow: RichTextRow): void {
        wordsRow.y = this.currentY;
        this.chatContainer.addChild(wordsRow);
        this.currentY += wordsRow.height + 20;

    }
}