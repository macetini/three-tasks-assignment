// src/core/mvcs/view/util/RichTextParser.ts
import { GameConfig } from "../../../config/GameConfig";
import type { IRichTextToken } from "./meta/IRichTextToken";

/** Available token types for the rendering engine. */
export type RichTokenType = "text" | "emoji";

/**
 * Utility class responsible for tokenizing raw strings into renderable content.
 * * It identifies special tags (e.g., {smile}) using a configurable Regular Expression
 * and segments the input into a linear array of text literals and graphical aliases.
 */
export class RichTextParser {
    public static readonly TEXT_TOKEN_TYPE: RichTokenType = "text";
    public static readonly EMOJI_TOKEN_TYPE: RichTokenType = "emoji";

    /**
     * Parses a raw string into an array of IRichTextTokens.
     * Scans the string for occurrences of the configured token regex,
     * splitting the string into text literals and emoji tokens.
     * 
     * @param rawString The raw string to parse.
     * 
     * @returns An array of IRichTextTokens representing the parsed string.
     */
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