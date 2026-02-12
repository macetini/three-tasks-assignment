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

    private readonly AVATAR_SIZE = 56;
    private readonly PADDING = 24;
    private readonly MAX_WIDTH = 250;
    private readonly MIN_WIDTH = 375;
    private readonly LINE_HEIGHT = 28;
    private readonly EMOJI_SIZE = 22;

    private readonly BUBBLE_LEFT_COLOR = 0x2196F3;
    private readonly BUBBLE_RIGHT_COLOR = 0x424242;
    private readonly BUBBLE_STROKE_COLOR = 0x222222;
    private readonly BUBBLE_STROKE_WIDTH = 2;
    private readonly BUBBLE_PADDING = 15;
    private readonly BUBBLE_CORNER_RADIUS = 15;

    private readonly background: Graphics;
    private readonly avatar: Sprite;
    private readonly message: Container;
    private readonly avatarPosition: AvatarPosition;
    private readonly textureProvider: (id: string) => Texture;

    /**
     * Constructs a new RichTextRow instance.
     * 
     * @param vo The MagicWordVO instance containing the character name and raw text.
     * @param position The AvatarPosition instance indicating whether the avatar should be on the left or right side of the chat bubble.
     * @param textureProvider The function to get the texture for a given id.
     */
    constructor(vo: MagicWordVO, position: AvatarPosition, textureProvider: (id: string) => Texture) {
        super();

        this.textureProvider = textureProvider;
        this.avatarPosition = position;

        this.background = new Graphics();

        this.avatar = new Sprite(this.textureProvider(vo.characterName));
        this.avatar.width = this.avatar.height = this.AVATAR_SIZE;

        this.message = this.createMessageContent(vo);
        this.addChild(this.background, this.avatar, this.message);

        this.drawBubble();

        this.updateLayout(this.MIN_WIDTH);
    }

    /**
     * Draws the chat bubble background and outline.
     * The bubble color is determined by the avatar position.
     * If the avatar is on the left side, the bubble color is BUBBLE_LEFT_COLOR.
     * If the avatar is on the right side, the bubble color is BUBBLE_RIGHT_COLOR.
     */
    private drawBubble(): void {
        const bubbleColor =
            this.avatarPosition ==
                this.cfg.DEFAULT_AVATAR_POSITION ?
                this.BUBBLE_LEFT_COLOR : this.BUBBLE_RIGHT_COLOR;

        this.background.clear();
        this.background
            .roundRect(
                -this.BUBBLE_PADDING,
                -this.BUBBLE_PADDING * 0.5,
                this.message.width + (this.BUBBLE_PADDING * 2),
                this.message.height + this.BUBBLE_PADDING,
                this.BUBBLE_CORNER_RADIUS
            )
            .fill({ color: bubbleColor, alpha: 1 })
            .stroke({
                color: this.BUBBLE_STROKE_COLOR,
                width: this.BUBBLE_STROKE_WIDTH
            });
    }


    /**
     * Updates the layout of the RichTextRow based on the provided container width.
     * This method is responsible for positioning the avatar, bubble, and message
     * content horizontally based on the avatar position.
     * If the avatar position is the default value, the avatar is positioned on the left
     * edge of the container and the bubble and message content are positioned to the right
     * of the avatar. If the avatar position is not the default value, the avatar is positioned on the
     * right edge of the container and the bubble and message content are positioned to the left
     * of the avatar.
     * 
     * @param containerWidth The width of the container that the RichTextRow is a child of.
     */
    public updateLayout(containerWidth: number): void {
        if (this.avatarPosition === this.cfg.DEFAULT_AVATAR_POSITION) {
            this.avatar.x = 1;
            this.background.x = this.message.x = this.AVATAR_SIZE + this.PADDING;
        } else {
            this.avatar.x = containerWidth - this.AVATAR_SIZE - 1;
            this.background.x = this.message.x = this.avatar.x - this.message.width - this.PADDING;
        }
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
    private createMessageContent(vo: MagicWordVO): Container {
        const container = new Container();

        let currentPos = { x: 0, y: this.addCharacterName(container, vo.characterName) };

        vo.tokens.forEach(token => {
            if (token.type === RichTextParser.TEXT_TOKEN_TYPE) {
                currentPos = this.addTextToken(container, token.value, currentPos);
            } else {
                currentPos = this.addEmojiToken(container, token.value, currentPos);
            }
        });

        return container;
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
    private addCharacterName(container: Container, name: string): number {
        const nameText = new Text({
            text: name,
            style: { fontSize: 14, fontWeight: 'bold', fill: 'white' }
        });
        container.addChild(nameText);
        return nameText.height + 5;
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
    private addTextToken(container: Container, value: string, pos: { x: number, y: number }) {
        const words = value.split(' ');

        words.forEach(word => {
            const txt = new Text({
                text: word + " ",
                style: { fontSize: 18, fill: 'white' }
            });

            pos = this.handleLineWrap(txt.width, pos);

            txt.position.set(pos.x, pos.y);
            container.addChild(txt);
            pos.x += txt.width;
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
    private addEmojiToken(container: Container, emojiId: string, pos: { x: number, y: number }) {
        const emoji = new Sprite(this.textureProvider(emojiId));
        emoji.width = emoji.height = this.EMOJI_SIZE;

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
    private handleLineWrap(elementWidth: number, pos: { x: number, y: number }) {

        if (pos.x + elementWidth > this.MAX_WIDTH && pos.x > 0) {
            return { x: 0, y: pos.y + this.LINE_HEIGHT };
        }
        return pos;
    }
}