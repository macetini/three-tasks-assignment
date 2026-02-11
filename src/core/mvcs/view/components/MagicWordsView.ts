import { Container, Text, Texture } from 'pixi.js';
import type { AvatarPosition } from '../../model/states/MagicWordsModel';
import type { MagicWordVO } from '../../model/states/vo/MagicWordVO';
import { AbstractView } from '../AbstractView';
import { RichTextRow } from './ui/RichTextRow';

export class MagicWordsView extends AbstractView {
    private readonly chatContainer = new Container();

    private currentY: number = 0;

    private isDragging: boolean = false;
    private lastPointerY: number = 0;

    public override init(): void {
        super.init();
        this.addChildAt(this.chatContainer, 0);

        this.addLoadingText();

        this.eventMode = 'static';
        this.on('pointerdown', this.onDragStart, this);
        this.on('pointermove', this.onDragMove, this);
        this.on('pointerup', this.onDragEnd, this);
        this.on('pointerupoutside', this.onDragEnd, this);
    }

    private addLoadingText(): void {
        const loadingText = new Text({
            text: "Loading Magic Words...",
            style: {
                fontSize: 24,
                fill: 0xffffff,
                align: 'center'
            }
        });
        loadingText.anchor.set(0.5);
        loadingText.position.set(
            this.width * 0.5 + loadingText.width * 0.5,
            this.height * 0.5);
        this.chatContainer.addChild(loadingText);
    }

    private onDragStart(event: any): void {
        this.isDragging = true;
        this.lastPointerY = event.global.y;
    }

    private onDragMove(event: any): void {
        if (!this.isDragging) return;

        const currentY = event.global.y;
        const deltaY = currentY - this.lastPointerY;
        this.lastPointerY = currentY;

        // Move the container
        this.chatContainer.y += deltaY;

        // Optional: Add constraints so user can't scroll into infinity
        const minScroll = -(this.chatContainer.height - 500); // adjust based on screen height
        const maxScroll = 50;

        if (this.chatContainer.y < minScroll) this.chatContainer.y = minScroll;
        if (this.chatContainer.y > maxScroll) this.chatContainer.y = maxScroll;
    }

    private onDragEnd(): void {
        this.isDragging = false;
    }

    public override layout(width: number, height: number): void {
        this.chatContainer.position.set(width * 0.5 - this.chatContainer.width * 0.5, 85);

        if (width <= 375 || height <= 375) return;

        let scale = Math.min(width / 375, height / 375);
        scale = Math.max(0, Math.min(scale, 1)); // No Clamp in Pixi :(
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