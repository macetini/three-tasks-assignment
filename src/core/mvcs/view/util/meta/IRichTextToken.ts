import type { RichTokenType } from "../type/RichTokenType";

export interface IRichTextToken {
    type: RichTokenType;
    value: string;
}