// src/core/mvcs/view/components/ui/RichTextRow.ts
import { Container, Graphics, Sprite, Text, Texture } from "pixi.js";
import { GameConfig } from "../../../../config/GameConfig";
import type { AvatarPosition } from "../../../model/states/MagicWordsModel";
import type { MagicWordVO } from "../../../model/states/vo/MagicWordVO";

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
        const { MAX_WIDTH } = this;
        const LINE_HEIGHT = 32;

        const nameText = new Text({
            text: vo.characterName,
            style: { fontSize: 14, fontWeight: 'bold', fill: 0xffffff }
        });
        container.addChild(nameText);

        let curX = 0;
        let curY = nameText.height + 5;

        vo.tokens.forEach(token => {
            if (token.type === 'text') {
                const words = token.value.split(' ');
                words.forEach(word => {
                    const txt = new Text({ text: word + " ", style: { fontSize: 18, fill: 0xeeeeee } });

                    if (curX + txt.width > MAX_WIDTH && curX > 0) {
                        curX = 0;
                        curY += LINE_HEIGHT;
                    }
                    txt.position.set(curX, curY);
                    container.addChild(txt);
                    curX += txt.width;
                });
            } else {
                const emoji = new Sprite(this.textureProvider(token.value));
                emoji.width = emoji.height = 24;

                if (curX + emoji.width > MAX_WIDTH && curX > 0) {
                    curX = 0;
                    curY += LINE_HEIGHT;
                }
                emoji.position.set(curX, curY);
                container.addChild(emoji);
                curX += emoji.width + 4;
            }
        });
        return container;
    }
}