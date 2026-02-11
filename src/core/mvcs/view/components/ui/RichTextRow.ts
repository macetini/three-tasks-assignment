// src/core/mvcs/view/components/ui/RichTextRow.ts
import { Cache, Container, Sprite, Text } from "pixi.js";
import { GameConfig } from "../../../../config/GameConfig";
import type { AvatarPosition } from "../../../model/states/MagicWordsModel";
import type { MagicWordVO } from "../../../model/states/vo/MagicWordVO";

export class RichTextRow extends Container {
    private readonly cfg = GameConfig.WORDS;

    private readonly AVATAR_SIZE = 64;
    private readonly PADDING = 12;
    private readonly MAX_WIDTH = 400; // Limits how wide the text can go

    constructor(vo: MagicWordVO, position: AvatarPosition) {
        super();

        const avatarAlias = Cache.has(vo.characterName) ? vo.characterName : "default";
        const avatar = Sprite.from(avatarAlias);

        avatar.width = avatar.height = this.AVATAR_SIZE;

        const message = this.createMessageContent(vo);

        // 3. Layout Positioning
        if (position === this.cfg.DEFAULT_AVATAR_POSITION) {
            message.x = this.AVATAR_SIZE + this.PADDING;
            this.addChild(avatar, message);
        } else {
            // Align to the right side of a fixed boundary (e.g., 700px)
            const rightEdge = 700;
            avatar.x = rightEdge - this.AVATAR_SIZE;
            message.x = avatar.x - message.width - this.PADDING;
            this.addChild(avatar, message);
        }
    }

    private createMessageContent(vo: MagicWordVO): Container {
        const container = new Container();

        // Add Character Name at the top
        const nameText = new Text({
            text: vo.characterName,
            style: {
                fontSize: 14,
                fontWeight: 'bold',
                fill: 0xffffff
            }
        });
        container.addChild(nameText);

        let currentX = 0;
        let currentY = nameText.height + 5;

        // Loop through tokens to build the "Flow"
        vo.tokens.forEach(token => {
            if (token.type === 'text') {
                const txt = new Text({
                    text: token.value,
                    style: {
                        fontSize: 18,
                        fill: 0xeeeeee
                    }
                });

                txt.x = currentX;
                txt.y = currentY;
                container.addChild(txt);
                currentX += txt.width + 4;
            } else {
                // It's an emoji!
                const emoji = Sprite.from(token.value);
                emoji.width = emoji.height = 24; // Match text height
                emoji.x = currentX;
                emoji.y = currentY - 2; // Slight adjustment for baseline
                container.addChild(emoji);
                currentX += emoji.width + 4;
            }
            // Simple line wrap if a single line gets too long
            if (currentX > this.MAX_WIDTH) {
                currentX = 0;
                currentY += 30;
            }
        });

        return container;
    }
}