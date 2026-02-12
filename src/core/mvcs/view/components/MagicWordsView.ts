import { Container, Rectangle, Text, Texture } from 'pixi.js';
import type { AvatarPosition } from '../../model/states/MagicWordsModel';
import type { MagicWordVO } from '../../model/states/vo/MagicWordVO';
import { AbstractView } from '../AbstractView';
import { RichTextRow } from './ui/RichTextRow';

/**
 * View managing a scrollable chat-like interface with Rich Text support.
 * Handles keyboard, mouse wheel, and touch-drag navigation.
 */
export class MagicWordsView extends AbstractView {
    private readonly SCROLL_STEP = 40; // Pixels per key press
    private readonly SCROLL_SPEED = 0.5;
    private readonly MAX_SCROLL_HEIGHT = 75;
    private readonly MIN_SCROLL_HEIGHT = 600; // It would be better to use screen height, but this will work on most devices
    private readonly MIN_SCREEN_WIDTH = 375; // It would be better to use screen width, but this will work on most devices
    private readonly MAX_SCALE = 1.3;
    private readonly CHAT_CONTAINER_Y_OFFSET = 85;
    private readonly LINE_PADDING = 20;

    private readonly chatContainer = new Container();
    private loadingText!: Text;

    private currentY: number = 0;

    private isDragging: boolean = false;
    private lastPointerY: number = 0;


    /**
     * Initializes the MagicWordsView.
     * Sets up event listeners for keyboard navigation, mouse wheel scrolling, and touch-drag navigation.
     * Adds a loading text element to the view and sets the event mode to 'static'.
     */
    public override init(): void {
        super.init();

        this.addLoadingText();
        this.addChildAt(this.chatContainer, 0);

        this.eventMode = 'static';

        globalThis.addEventListener('keydown', this.onArrowKeyDown);

        this.on('wheel', this.onMouseWheel, this);

        this.on('pointerdown', this.onDragStart, this);
        this.on('pointermove', this.onDragMove, this);
        this.on('pointerup', this.onDragEnd, this);
        this.on('pointerupoutside', this.onDragEnd, this);
    }

    /**
     * Removes all event listeners and cleans up the view for garbage collection.
     * Should be called when the view is no longer needed.
     */
    public override dispose(): void {
        super.dispose();

        globalThis.removeEventListener('keydown', this.onArrowKeyDown);

        this.off('wheel', this.onMouseWheel, this);

        this.off('pointerdown', this.onDragStart, this);
        this.off('pointermove', this.onDragMove, this);
        this.off('pointerup', this.onDragEnd, this);
        this.off('pointerupoutside', this.onDragEnd, this);
    }

    /**
     * Creates and adds a loading text to the view.
     * This text is centered and has a white fill with a font size of 24.
     * It is initially hidden and can be shown by calling showLoading() and hidden again by calling hideLoading().
     */
    private addLoadingText(): void {
        this.loadingText = new Text({
            text: "Loading Magic Words",
            style: {
                fontSize: 24,
                fill: 'white',
                align: 'center'
            }
        });
        this.loadingText.anchor.set(0.5);
        this.loadingText.visible = false;
        this.addChild(this.loadingText);
    }


    /**
     * Shows the loading text.
     * This should be called when a loading task starts.
     */
    public showLoading(): void {
        this.loadingText.visible = true;
    }

    /**
     * Hides the loading text.
     */
    public hideLoading(): void {
        this.loadingText.visible = false;
    }

    /**
     * 
     * Called when the user presses the up or down arrow keys to scroll the content vertically.
     * 
     * @param event 
     */
    private readonly onArrowKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'ArrowUp') {
            this.applyScroll(this.SCROLL_STEP);
        } else if (event.key === 'ArrowDown') {
            this.applyScroll(-this.SCROLL_STEP);
        }
    };

    /**
     * Called when the user uses the mouse wheel to scroll the content vertically.
     * We invert the delta because wheel down = content moves up.
     * 
     * @param event The event object passed by Pixi.js containing the delta Y value.
     */
    private onMouseWheel(event: WheelEvent): void {
        // We invert it because wheel down = content moves up
        const scrollSpeed = this.SCROLL_SPEED;
        this.applyScroll(-event.deltaY * scrollSpeed);
    }


    /**
     * Called when the user starts dragging the content vertically.
     * Sets the dragging flag to true and records the initial pointer Y position.
     * @param event The event object passed by Pixi.js
     */
    private onDragStart(event: any): void {
        this.isDragging = true;
        this.lastPointerY = event.global.y;
    }

    /**
     * Called when the user drags the content vertically.
     * Updates the last pointer Y position and applies the delta to the content.
     * @param event The event object passed by Pixi.js
     */
    private onDragMove(event: any): void {
        if (!this.isDragging) return;

        const currentY = event.global.y;
        const deltaY = currentY - this.lastPointerY;
        this.lastPointerY = currentY;

        this.applyScroll(deltaY);
    }

    /**
     * Applies a scroll delta to the chat container, ensuring it stays within the boundary.
     * Boundary logic is as follows:
     * - Minimum scroll: the maximum between 0 and the view height minus the chat container height.
     * - Maximum scroll: the maximum scroll height.
     * The chat container's y position is updated to be the maximum of the minimum scroll and the minimum of the maximum scroll and the current y position plus the delta.
     * @param {number} delta - The scroll delta to apply.
     */
    private applyScroll(delta: number): void {
        //Boundary Logic        
        const viewHeight = this.MIN_SCROLL_HEIGHT;
        const minScroll = Math.min(0, viewHeight - this.chatContainer.height);
        const maxScroll = this.MAX_SCROLL_HEIGHT;

        // Optimized clamp
        this.chatContainer.y = Math.max(minScroll, Math.min(this.chatContainer.y + delta, maxScroll));
    }

    private onDragEnd(): void {
        this.isDragging = false;
    }

    /**
     * Override to handle responsive layout.
     * Scales the chat container based on the minimum dimension of the screen.
     * Centers the loading text and chat container horizontally.
     * Moves the chat container down by CHAT_CONTAINER_Y_OFFSET pixels.
     * Enables hit area for dragging or mouse scroll events.
     * Logs the scale used for debugging purposes.
     * 
     * @param width The actual width available for the chat.
     * @param height The actual height available for the chat.
     */
    public override layout(width: number, height: number): void {
        this.hitArea = new Rectangle(0, 0, width, height); // Hit area, for dragging or mouse scroll

        this.loadingText.position.set(width * 0.5, height * 0.5);
        this.chatContainer.position.set(
            width * 0.5 - this.chatContainer.width * 0.5,
            this.CHAT_CONTAINER_Y_OFFSET);

        let scale = Math.min(width / this.MIN_SCREEN_WIDTH, height / this.MIN_SCREEN_WIDTH);
        scale = Math.max(1, Math.min(scale, this.MAX_SCALE));

        this.chatContainer.scale.set(scale);

        // Too much logging (enable if needed)
        console.debug(`[MagicWordsView] Using custom layout. Layout scaled to ${scale}.`);
    }

    /**
     * Rebuilds the chat container with new MagicWords.
     * If the words length is 0, it will log a warning and do nothing.
     * 
     * @param words The new MagicWords to render.
     * @param options The options to pass to RichTextRow.
     * @param options.textureProvider The function to get the texture for a given id.
     * @param options.positionProvider The function to get the position for a given character name.
     */
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

    /**
     * Adds a new RichTextRow to the chat container.
     * Sets the y position of the row to the currentY value.
     * Adds the row to the chat container.
     * Increments the currentY value by the height of the row plus the LINE_PADDING value.
     * 
     * @param wordsRow The RichTextRow to add to the chat container.
     */
    public addRow(wordsRow: RichTextRow): void {
        wordsRow.y = this.currentY;
        this.chatContainer.addChild(wordsRow);
        this.currentY += wordsRow.height + this.LINE_PADDING;

    }
}