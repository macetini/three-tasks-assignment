// src/core/mvcs/view/util/meta/IRichTextToken.ts
import type { RichTokenType } from "../RichTextParser";

/**
 * Interface representing a single unit of content in the Rich Text system.
 * * A token acts as a lightweight data contract between the RichTextParser 
 * and the rendering components, defining whether a specific segment 
 * of dialogue should be treated as literal text or a graphical emoji.
 */
export interface IRichTextToken {
    /** * The classification of the token (e.g., 'text' or 'emoji').
     * Used by the view to determine which component to instantiate.
     */
    type: RichTokenType;

    /** * The payload of the token.
     * For text: The literal string to display.
     * For emojis: The unique identifier/alias for the texture lookup.
     */
    value: string;
}