import type { RichTokenType } from "../RichTextParser";

export interface IRichTextToken {
    type: RichTokenType;
    value: string;
}