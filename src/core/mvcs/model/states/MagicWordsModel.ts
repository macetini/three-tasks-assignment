import type { MagicWordVO } from "./vo/MagicWordVO";

// src/core/mvcs/model/states/MagicWordsModel.ts
export class MagicWordsModel {
    public static readonly NAME = "magicWordsModel";

    private _words: MagicWordVO[] = [];

    public setData(data: MagicWordVO[]): void {
        this._words = data;
    }

    public get words(): MagicWordVO[] {
        return this._words;
    }

    public getRandomWord(): string {
        if (this._words.length === 0) {
            return "Loading...";
        }
        const index = Math.floor(Math.random() * this._words.length);
        return this._words[index].value;
    }
}