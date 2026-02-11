// src/core/mvcs/model/states/vo/MagicWordVO.ts
import type { IRichTextToken } from "../../../view/util/meta/IRichTextToken";
import { RichTextParser } from "../../../view/util/RichTextParser";

export class MagicWordVO {
    public readonly characterName: string;
    public readonly rawText: string;

    private _tokens: IRichTextToken[] | null = null;

    /**
     * Lazy-cached tokens for the RichTextRow to consume.
     */
    public get tokens(): IRichTextToken[] {        
        this._tokens ??= RichTextParser.parse(this.rawText);
        return this._tokens;
    }

    constructor(characterName: string, rawText: string) {
        this.characterName = characterName;
        this.rawText = rawText;
    }
}