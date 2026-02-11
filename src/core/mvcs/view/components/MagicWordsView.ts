import { Container, Rectangle, Text, Texture } from 'pixi.js';
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

        this.on('wheel', this.onMouseWheel, this);
    }

    public override dispose(): void {
        super.dispose();

        this.off('pointerdown', this.onDragStart, this);
        this.off('pointermove', this.onDragMove, this);
        this.off('pointerup', this.onDragEnd, this);
        this.off('pointerupoutside', this.onDragEnd, this);

        this.off('wheel', this.onMouseWheel, this);
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

    private onMouseWheel(event: WheelEvent): void {
        // scrollDeltaY usually comes in as 100 or -100 per click
        // We invert it because wheel down = content moves up
        const scrollSpeed = 0.5;
        this.applyScroll(-event.deltaY * scrollSpeed);
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

        this.applyScroll(deltaY);
    }

    /**
     * Shared logic for moving the container and clamping boundaries
     */
    private applyScroll(delta: number): void {
        this.chatContainer.y += delta;

        // Boundary Logic
        // Adjust 600 based on your app height (or use this.app.screen.height)
        const viewHeight = 600;
        const minScroll = Math.min(0, viewHeight - this.chatContainer.height - 100);
        const maxScroll = 50;

        // Optimized clamp
        this.chatContainer.y = Math.max(minScroll, Math.min(this.chatContainer.y, maxScroll));
    }

    private onDragEnd(): void {
        this.isDragging = false;
    }

    public override layout(width: number, height: number): void {
        this.hitArea = new Rectangle(0, 0, width, height); // Hit area, for dragging or mouse scroll

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