import { Container, Rectangle, Text, Texture } from 'pixi.js';
import type { AvatarPosition } from '../../model/states/MagicWordsModel';
import type { MagicWordVO } from '../../model/states/vo/MagicWordVO';
import { AbstractView } from '../AbstractView';
import { RichTextRow } from './ui/RichTextRow';

export class MagicWordsView extends AbstractView {
    private readonly SCROLL_STEP = 40; // Pixels per key press
    private readonly SCROLL_SPEED = 0.5;

    private readonly chatContainer = new Container();

    private currentY: number = 0;

    private isDragging: boolean = false;
    private lastPointerY: number = 0;

    public override init(): void {
        super.init();        
        this.addChildAt(this.chatContainer, 0);

        this.addLoadingText();

        this.eventMode = 'static';

        globalThis.addEventListener('keydown', this.onArrowKeyDown);

        this.on('wheel', this.onMouseWheel, this);

        this.on('pointerdown', this.onDragStart, this);
        this.on('pointermove', this.onDragMove, this);
        this.on('pointerup', this.onDragEnd, this);
        this.on('pointerupoutside', this.onDragEnd, this);
    }

    public override dispose(): void {
        super.dispose();

        globalThis.removeEventListener('keydown', this.onArrowKeyDown);

        this.off('wheel', this.onMouseWheel, this);

        this.off('pointerdown', this.onDragStart, this);
        this.off('pointermove', this.onDragMove, this);
        this.off('pointerup', this.onDragEnd, this);
        this.off('pointerupoutside', this.onDragEnd, this);
    }

    private addLoadingText(): void {
        const loadingText = new Text({
            text: "Loading Magic Words",
            style: {
                fontSize: 24,
                fill: 0xffffff,
                align: 'left'
            }
        });
        loadingText.position.set(
            this.chatContainer.width * 0.5,
            this.chatContainer.y);
        this.chatContainer.addChild(loadingText);
    }

    private readonly onArrowKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'ArrowUp') {
            this.applyScroll(this.SCROLL_STEP);
        } else if (event.key === 'ArrowDown') {
            this.applyScroll(-this.SCROLL_STEP);
        }
    };

    private onMouseWheel(event: WheelEvent): void {    
        // We invert it because wheel down = content moves up
        const scrollSpeed = this.SCROLL_SPEED;
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
        //Boundary Logic        
        const viewHeight = 500; // It would be better to use screen height, but this will work on most devices
        const minScroll = Math.min(0, viewHeight - this.chatContainer.height);
        const maxScroll = 75;

        // Optimized clamp
        this.chatContainer.y = Math.max(minScroll, Math.min(this.chatContainer.y + delta, maxScroll));
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