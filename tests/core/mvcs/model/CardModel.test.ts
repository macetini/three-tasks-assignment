import { Sprite } from 'pixi.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { CardModel } from '../../../../src/core/mvcs/model/states/CardModel';

describe('CardModel', () => {
    let model: CardModel;

    beforeEach(() => {
        model = new CardModel();
    });

    it('should be initialized with an empty array of cards', () => {
        expect(model.cards).toEqual([]);
        expect(model.cards.length).toBe(0);
    });

    it('should store and retrieve card sprites correctly', () => {        
        const mockCards = [
            new Sprite(),
            new Sprite(),
            new Sprite()
        ];

        model.setCards(mockCards);

        expect(model.cards.length).toBe(3);
        expect(model.cards).toBe(mockCards); // Reference check
        expect(model.cards[0]).toBeInstanceOf(Sprite);
    });

    it('should clear the card collection', () => {
        model.setCards([new Sprite(), new Sprite()]);
        expect(model.cards.length).toBe(2);

        model.clear();

        expect(model.cards).toEqual([]);
        expect(model.cards.length).toBe(0);
    });

    it('should expose the static NAME for the ModelMap', () => {
        expect(CardModel.NAME).toBe('cardModel');
    });
});