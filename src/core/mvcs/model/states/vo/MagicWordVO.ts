// src/core/mvcs/model/states/vo/MagicWordVO.ts
import type { IRichTextToken } from "../../../view/util/meta/IRichTextToken";
import { RichTextParser } from "../../../view/util/RichTextParser";

/**
 * Value Object representing a single dialogue entry.
 * * This class encapsulates the raw data from the API and provides 
 * lazy-initialized tokens for the Rich Text rendering engine.
 */
export class MagicWordVO {
    /** The identifier of the character speaking. */
    public readonly characterName: string;

    /** The original string containing potential rich text tags (e.g., {smile}). */
    public readonly rawText: string;

    /** Internal cache for the parsed tokens to ensure parsing only happens once. */
    private _tokens: IRichTextToken[] | null = null;

    /**
     * Lazy-cached tokens for the RichTextRow to consume.
     */
    public get tokens(): IRichTextToken[] {
        this._tokens ??= RichTextParser.parse(this.rawText);
        return this._tokens;
    }

    /**
     * Constructs a new MagicWordVO instance.
     * 
     * @param characterName The character name associated with the magic word.
     * @param rawText The raw text of the magic word, which will be parsed into RichTextTokens.
     */
    constructor(characterName: string, rawText: string) {
        this.characterName = characterName;
        this.rawText = rawText;
    }
}