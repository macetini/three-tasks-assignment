// src/core/mvcs/model/CardModel.ts
import { Sprite } from 'pixi.js';

export class CardModel {
    public static readonly NAME = 'cardModel';
    
    private _cards: Sprite[] = [];

    public setCards(cards: Sprite[]): void {
        this._cards = cards;
    }

    public get cards(): Sprite[] {
        return this._cards;
    }

    public clear(): void {
        this._cards = [];
    }
}