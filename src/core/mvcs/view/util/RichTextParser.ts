import type { IRichTextToken } from "./meta/IRichTextToken";

// src/core/mvcs/view/util/RichTextParser.ts
export class RichTextParser {
    private static readonly TOKEN_REGEX = /{{(.*?)}}/g;

    public static parse(rawString: string): IRichTextToken[] {
        const tokens: IRichTextToken[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        // Reset regex state
        this.TOKEN_REGEX.lastIndex = 0;

        while ((match = this.TOKEN_REGEX.exec(rawString)) !== null) {
            if (match.index > lastIndex) {
                tokens.push({
                    type: "text", // String literal
                    value: rawString.substring(lastIndex, match.index)
                });
            }

            tokens.push({
                type: "icon", // String literal
                value: match[1]
            });

            lastIndex = this.TOKEN_REGEX.lastIndex;
        }

        if (lastIndex < rawString.length) {
            tokens.push({
                type: "text",
                value: rawString.substring(lastIndex)
            });
        }

        return tokens;
    }
}