import { GameConfig } from "../../../config/GameConfig";
import type { IRichTextToken } from "./meta/IRichTextToken";

export type RichTokenType = "text" | "emoji";

export class RichTextParser {
    private static readonly TEXT_TOKEN_TYPE: RichTokenType = "text";
    private static readonly EMOJI_TOKEN_TYPE: RichTokenType = "emoji";

    public static parse(rawString: string): IRichTextToken[] {
        const tokens: IRichTextToken[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        const regex = GameConfig.WORDS.TOKEN_REGEX;
        regex.lastIndex = 0;

        while ((match = regex.exec(rawString)) !== null) {
            if (match.index > lastIndex) {
                tokens.push({
                    type: RichTextParser.TEXT_TOKEN_TYPE, // String literal
                    value: rawString.substring(lastIndex, match.index)
                });
            }
            tokens.push({
                type: RichTextParser.EMOJI_TOKEN_TYPE, // Emoji icon
                value: match[1]
            });
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < rawString.length) {
            tokens.push({
                type: RichTextParser.TEXT_TOKEN_TYPE,
                value: rawString.substring(lastIndex)
            });
        }
        return tokens;
    }
}