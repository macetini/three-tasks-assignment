// src/core/mvcs/model/CardModel.ts
import { Sprite } from 'pixi.js';

/**
 * Domain Model for the Ace of Shadows feature.
 * * Acts as a centralized repository for the 144 procedurally generated 
 * card sprites. This model enables the persistence of the card stack 
 * state across view transitions.
 */
export class CardModel {
    public static readonly NAME = 'cardModel';

    // No need for VO, it's just a collection of sprites
    private _cards: Sprite[] = [];

    /**
     * Sets the array of sprites representing the cards in the model.
     * This method is called by PrepareCardsCommand after generating the card textures.
     * 
     * @param cards The array of sprites representing the cards to set in the model.
     */
    public setCards(cards: Sprite[]): void {
        this._cards = cards;
    }

    /**
     * Returns the array of sprites representing the cards in the model.
     * This data is set by PrepareCardsCommand after generating the card textures.
     * 
     * @returns The array of sprites representing the cards in the model.
     */
    public get cards(): Sprite[] {
        return this._cards;
    }

    /**
     * Clears the array of sprites representing the cards in the model.
     * This method is used by PrepareCardsCommand to reset the model before generating new card textures.
     */
    public clear(): void {
        this._cards = [];
    }
}