// src/core/mvcs/view/components/ui/RichTextRow.ts
import { Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import { GameConfig } from "../../../../config/GameConfig";
import type { AvatarPosition } from "../../../model/states/MagicWordsModel";
import type { MagicWordVO } from "../../../model/states/vo/MagicWordVO";
import { RichTextParser } from "../../util/RichTextParser";

/**
 * A composite UI component that renders a chat bubble with mixed text and emojis.
 * Supports automated line wrapping and directional alignment based on the speaker.
 */
export class RichTextRow extends Container {
    private readonly cfg = GameConfig.WORDS;

    private readonly rawData: MagicWordVO;

    private readonly avatar: Sprite;
    private readonly textContainer: Container = new Container();
    private readonly background: Graphics = new Graphics();

    private readonly avatarPosition: AvatarPosition;
    private readonly textureProvider: (id: string) => Texture;

    private oldScale: number = 0;

    /**
     * Constructs a new RichTextRow instance.
     * 
     * @param vo The MagicWordVO instance containing the character name and raw text.
     * @param position The AvatarPosition instance indicating whether the avatar should be on the left or right side of the chat bubble.
     * @param textureProvider The function to get the texture for a given id.
     */
    constructor(vo: MagicWordVO, position: AvatarPosition, textureProvider: (id: string) => Texture) {
        super();

        this.rawData = vo;

        this.textureProvider = textureProvider;
        this.avatarPosition = position;

        this.avatar = new Sprite(this.textureProvider(vo.characterName));
        this.addChild(this.background, this.avatar, this.textContainer);
    }

    /**
     * Updates the layout of the RichTextRow based on the provided scale.
     * If the absolute difference between the old scale and the new scale is less than 0.01, the method does nothing.
     * Otherwise, it destroys all its children, redraws the avatar and the chat bubble, and updates the position of its child elements.
     * This method is called by the RichTextRow's parent when the view's layout needs to be updated, such as when the screen size changes.
     * 
     * @param scale The new scale to update the layout with.
     */
    public updateLayout(scale: number): void {
        // Too much logging (enable if needed)
        //console.debug(`[${this.constructor.name}] Layout update requested. View New Scale: ${scale} - Old Scale: ${this.oldScale} - Diff: ${Math.abs(this.oldScale - scale)}`);

        if (Math.abs(this.oldScale - scale) < this.cfg.SCALE_THRESHOLD) {
            this.oldScale = scale;
            return;
        }

        // NOTE: Redrawing the all the rows seems to be marginally more efficient 
        // that updating the scale (style) of the existing rows.
        this.destroyTextRows();

        this.avatar.width = this.avatar.height = this.cfg.AVATAR_SIZE * scale;
        this.createMessageContent(this.rawData, scale);

        this.drawBubble();

        if (this.avatarPosition === this.cfg.DEFAULT_AVATAR_POSITION) {
            this.avatar.x = 1;
            this.background.x = this.textContainer.x = this.avatar.width + this.cfg.PADDING;
        } else {
            this.avatar.x = this.cfg.MIN_SCREEN_WIDTH * scale - this.avatar.width - 1;
            this.background.x = this.textContainer.x = this.avatar.x - this.textContainer.width - this.cfg.PADDING;
        }

        this.oldScale = scale;

        // Too much logging (enable if needed)
        //console.debug(`[${this.constructor.name}] Layout updated. View scale: ${scale}`);
    }

    /**
     * Destroys all the children of the textContainer, freeing up any GPU memory used by Text objects.
     * This method is called by the RichTextRow's parent when the view's layout needs to be updated, such as when the screen size changes.
     */
    private destroyTextRows(): void {
        while (this.textContainer.children.length > 0) {
            const child = this.textContainer.children[0];
            child.destroy({ children: true, texture: true });
        }
    }

    /**
     * Draws the chat bubble background and outline.
     * The bubble color is determined by the avatar position.
     * If the avatar is on the left side, the bubble color is BUBBLE_LEFT_COLOR.
     * If the avatar is on the right side, the bubble color is BUBBLE_RIGHT_COLOR.
     */
    private drawBubble(): void {
        this.background.clear();

        const bubbleColor =
            this.avatarPosition ==
                this.cfg.DEFAULT_AVATAR_POSITION ?
                this.cfg.BUBBLE_LEFT_COLOR : this.cfg.BUBBLE_RIGHT_COLOR;

        this.background.clear();
        this.background
            .roundRect(
                -this.cfg.BUBBLE_PADDING,
                -this.cfg.BUBBLE_PADDING * 0.5,
                this.textContainer.width + (this.cfg.BUBBLE_PADDING * 2),
                this.textContainer.height + this.cfg.BUBBLE_PADDING,
                this.cfg.BUBBLE_CORNER_RADIUS
            )
            .fill({ color: bubbleColor, alpha: 1 })
            .stroke({
                color: this.cfg.BUBBLE_STROKE_COLOR,
                width: this.cfg.BUBBLE_STROKE_WIDTH
            });
    }

    /**
     * Creates a new Container instance containing the character name and RichTextTokens.
     * The character name is added as a child of the container with a bold white font.
     * The RichTextTokens are then added as children of the container, with the position of each
     * token determined by the position of the previous token.
     * 
     * @param vo The MagicWordVO instance containing the character name and RichTextTokens.
     * @returns A new Container instance containing the character name and RichTextTokens.
     */
    private createMessageContent(vo: MagicWordVO, scale: number): void {
        const initY = this.addCharacterName(this.textContainer, vo.characterName, scale);

        let currentPos = { x: 0, y: initY, scale: scale };
        vo.tokens.forEach(token => {
            if (token.type === RichTextParser.TEXT_TOKEN_TYPE) {
                currentPos = this.addTextToken(this.textContainer, token.value, currentPos);
            } else {
                currentPos = this.addEmojiToken(this.textContainer, token.value, currentPos);
            }
        });
    }

    /**
     * Adds a character name text to the given container.
     * The text is added as a child of the container and is styled with a bold white font.
     * The function returns the height of the added text plus 5 pixels.
     * 
     * @param container The container to add the character name text to.
     * @param name The character name to add.
     * @returns The height of the added text plus 5 pixels.
     */
    private addCharacterName(container: Container, name: string, scale: number): number {
        const nameText = new Text({
            text: name,
            style: { fontSize: 14 * scale, fontWeight: 'bold', fill: 'white' }
        });
        container.addChild(nameText);
        return 14 * scale * 1.25;
    }

    /**
     * Adds a RichTextToken of type TEXT_TOKEN_TYPE to the given container.
     * Splits the text into individual words and handles line wrapping for each word.
     * The position is updated after adding each word.
     * 
     * @param container The container to add the text token to.
     * @param value The value of the text token.
     * @param pos The current position to add the text token at.
     * 
     * @returns The new position after adding the text token.
     */
    private addTextToken(container: Container, value: string, pos: { x: number, y: number, scale: number }): { x: number, y: number, scale: number } {
        const words = value.split(' ');

        words.forEach((word) => {
            const text = new Text({ text: word + " " });

            text.style = { fontSize: 18 * pos.scale, fill: 'white' };
            pos = this.handleLineWrap(text.width, pos);

            text.position.set(pos.x, pos.y);
            container.addChild(text);
            pos.x += text.width;
        });

        return pos;
    }

    /**
     * Adds an emoji token to the RichTextRow's container.
     * Handles line wrapping by checking if the current position plus the width of the emoji
     * exceeds the maximum allowed width. If so, it resets the x coordinate to 0 and increments
     * the y coordinate by the line height.
     * 
     * @param container The container to add the emoji token to.
     * @param emojiId The ID of the emoji to add.
     * @param pos The current position to add the emoji token at.
     * 
     * @return The new position after adding the emoji token.
     */
    private addEmojiToken(container: Container, emojiId: string, pos: { x: number, y: number, scale: number }): { x: number, y: number, scale: number } {
        const emoji = new Sprite(this.textureProvider(emojiId));
        emoji.width = emoji.height = this.cfg.EMOJI_SIZE * pos.scale;

        pos = this.handleLineWrap(emoji.width, pos);

        emoji.position.set(pos.x, pos.y - 1);
        container.addChild(emoji);
        pos.x += emoji.width + 4;

        return pos;
    }

    /**
     * Handles line wrapping for a RichTextRow.
     * If the current position (pos.x) plus the width of the element to be added
     * exceeds the maximum allowed width (this.MAX_WIDTH), and the current position
     * is not at the start of a line (pos.x > 0), the method returns a new position
     * with the x coordinate set to 0 and the y coordinate incremented by the line height.
     * Otherwise, the method returns the original position unchanged.
     * 
     * @param elementWidth The width of the element to be added.
     * @param pos The current position.
     * 
     * @return The new position after handling line wrapping.
     */
    private handleLineWrap(elementWidth: number, pos: { x: number, y: number, scale: number }): { x: number, y: number, scale: number } {

        if (pos.x + elementWidth > this.cfg.MAX_WIDTH * pos.scale && pos.x > 0) {
            return { x: 0, y: pos.y + this.cfg.LINE_HEIGHT * pos.scale, scale: pos.scale };
        }
        return pos;
    }
}