import { Color, Container, Sprite, Texture } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class AceOfShadowsView extends AbstractView {
    private readonly Y_OFFSET = 2; // Offset for the stacking effect

    private readonly stackA = new Container();
    private readonly stackB = new Container();

    private readonly cards: Container[] = [];

    protected readonly content = new Container();

    public override init(): void {
        super.init();
        this.addChild(this.content);
        this.stackA.position.set(-275, 100);
        this.stackB.position.set(275, 100);
        this.content.addChild(this.stackA, this.stackB);
    }

    public override layout(w: number, h: number): void {
        // 1. Center the design box
        this.content.position.set(w * 0.5, h * 0.5);

        // 2. The "Safe Zone" Math (Design for 1000x1000)
        // This ensures the content is ALWAYS visible and NEVER overflows
        const scale = Math.min(w / 1000, h / 1000);
        this.content.scale.set(scale);        
    }

    public populateDeck(textures: Texture[], outlineTexture: Texture): void {
        for (let i = 0; i < 144; i++) {
            const cardUnit = new Container();

            const patternTexture = textures[i % 10];
            const pattern = new Sprite(patternTexture);
            pattern.anchor.set(0.5);
            pattern.tint = this.getRandomVibrantColor(i);

            const outline = new Sprite(outlineTexture);
            outline.anchor.set(0.5);

            // Stack them: Outline on top of Pattern
            cardUnit.addChild(pattern);
            cardUnit.addChild(outline);

            // Playfulness: Add a tiny random rotation to each card
            cardUnit.x = 0;
            cardUnit.y = -(i * this.Y_OFFSET);
            cardUnit.rotation = (Math.random() - 0.5) * 0.5;

            this.cards.push(cardUnit);

            this.stackA.addChild(cardUnit);
        }
    }

    /**
     * Generates a unique, high-vibrancy color for each card.
     */
    private getRandomVibrantColor(index: number): number {
        const hue = (index * 137.508) % 360;
        return new Color({ h: hue, s: 80, v: 100 }).toNumber();
    }

    /**
     * Pops the top card from Stack A. 
     * In PIXI, the 'top' card is the one with the highest index in our array.
     */
    /*
    public getNextCardFromA(): Container | undefined {
        return this.stackA.pop();
    }*/

    /**
     * Logic for landing a card in Stack B
     */
    /*
    public landCardInB(card: Sprite): void {
        const indexInB = this._stackB.length;

        // Re-calculate Y for Stack B so it builds up
        card.x = this.STACK_B_X;
        card.y = this.STACK_Y - (indexInB * this.Y_OFFSET);

        this._stackB.push(card);

        // Move to top of the display list to ensure it sits on top of Stack B
        this.addChild(card);
    }

    public get stackBX(): number { return this.STACK_B_X; }
    public getStackBY(index: number): number { return this.STACK_Y - (index * this.Y_OFFSET); }
    public get stackBLength(): number { return this.stackB.length; }
    */
}