// src/core/mvcs/view/components/ui/RichTextRow.ts
import { Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import { GameConfig } from "../../../../config/GameConfig";
import type { AvatarPosition } from "../../../model/states/MagicWordsModel";
import type { MagicWordVO } from "../../../model/states/vo/MagicWordVO";
import { RichTextParser } from "../../util/RichTextParser";

export class RichTextRow extends Container {
    private readonly cfg = GameConfig.WORDS;

    private readonly AVATAR_SIZE = 58;
    private readonly PADDING = 24;
    private readonly MAX_WIDTH = 250;
    private readonly MIN_WIDTH = 375;

    private readonly background: Graphics;
    private readonly avatar: Sprite;
    private readonly message: Container;
    private readonly avatarPosition: AvatarPosition;
    private readonly textureProvider: (id: string) => Texture;

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

    private drawBubble(): void {
        const padding = 15;
        const cornerRadius = 15;

        const bubbleColor = this.avatarPosition == this.cfg.DEFAULT_AVATAR_POSITION ? 0x2196F3 : 0x424242;

        this.background.clear();
        this.background
            .roundRect(
                -padding,
                -padding * 0.5,
                this.message.width + (padding * 2),
                this.message.height + padding,
                cornerRadius
            )
            .fill({ color: bubbleColor, alpha: 1 })
            .stroke({ color: 0x222222, width: 2 });
    }

    /**
     * Call this from MagicWordsView.layout() to handle responsiveness.
     * @param containerWidth The actual width available for the chat.
     */
    public updateLayout(containerWidth: number): void {
        if (this.avatarPosition === this.cfg.DEFAULT_AVATAR_POSITION) {
            this.avatar.x = 0;
            this.background.x = this.message.x = this.AVATAR_SIZE + this.PADDING;
        } else {
            this.avatar.x = containerWidth - this.AVATAR_SIZE;
            this.background.x = this.message.x = this.avatar.x - this.message.width - this.PADDING;
        }
    }

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

    private addCharacterName(container: Container, name: string): number {
        const nameText = new Text({
            text: name,
            style: { fontSize: 14, fontWeight: 'bold', fill: 0xffffff }
        });
        container.addChild(nameText);
        return nameText.height + 5;
    }

    private addTextToken(container: Container, value: string, pos: { x: number, y: number }) {
        const words = value.split(' ');

        words.forEach(word => {
            const txt = new Text({
                text: word + " ",
                style: { fontSize: 18, fill: 0xeeeeee }
            });

            pos = this.handleLineWrap(txt.width, pos);

            txt.position.set(pos.x, pos.y);
            container.addChild(txt);
            pos.x += txt.width;
        });

        return pos;
    }

    private addEmojiToken(container: Container, emojiId: string, pos: { x: number, y: number }) {
        const emoji = new Sprite(this.textureProvider(emojiId));
        emoji.width = emoji.height = 24;

        pos = this.handleLineWrap(emoji.width, pos);

        emoji.position.set(pos.x, pos.y);
        container.addChild(emoji);
        pos.x += emoji.width + 4;

        return pos;
    }

    private handleLineWrap(elementWidth: number, pos: { x: number, y: number }) {
        const LINE_HEIGHT = 32;

        if (pos.x + elementWidth > this.MAX_WIDTH && pos.x > 0) {
            return { x: 0, y: pos.y + LINE_HEIGHT };
        }
        return pos;
    }
}