// src/core/mvcs/view/components/ui/RichTextRow.ts
import { Container, Sprite, Text } from "pixi.js";
import type { AvatarPosition } from "../../../model/states/MagicWordsModel";
import type { MagicWordVO } from "../../../model/states/vo/MagicWordVO";

export class RichTextRow extends Container {
    private readonly AVATAR_SIZE = 64;
    private readonly PADDING = 12;
    private readonly MAX_WIDTH = 400; // Limits how wide the text can go

    constructor(vo: MagicWordVO, position: AvatarPosition) {
        super();

        // 1. Avatar (Using the character name alias we loaded in AssetService)
        const avatar = Sprite.from(vo.characterName);
        avatar.width = avatar.height = this.AVATAR_SIZE;

        // 2. The Message (This fixes your TS error)
        const message = this.createMessageContent(vo);

        // 3. Layout Positioning
        if (position === "left") {
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
        const nameText = new Text(vo.characterName, {
            fontSize: 14,
            fontWeight: 'bold',
            fill: 0xffffff
        });
        container.addChild(nameText);

        let currentX = 0;
        let currentY = nameText.height + 5;

        // Loop through tokens to build the "Flow"
        vo.tokens.forEach(token => {
            if (token.type === 'text') {
                const txt = new Text(token.value, { fontSize: 18, fill: 0xeeeeee });
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