import { Color, Container, Sprite } from 'pixi.js';
import type { AssetService } from '../../service/AssetService';

export class AceOfShadowsView extends Container {
    private _stackA: Container[] = [];
    private _stackB: Container[] = [];

    private readonly STACK_A_X = 200;
    private readonly STACK_B_X = 600;
    private readonly STACK_Y = 500;
    private readonly Y_OFFSET = 2; // Offset for the stacking effect

    private readonly assetService: AssetService;

    constructor(assetService: AssetService) {
        super();
        this.assetService = assetService;
        this.createDeck();
    }

    private createDeck(): void {
        for (let i = 0; i < 144; i++) {
            const cardUnit = new Container();

            // Get one of our baked Voronoi textures
            const patternTexture = this.assetService.getRandomCardTexture(i);
            const pattern = new Sprite(patternTexture);
            pattern.anchor.set(0.5);
            pattern.tint = this.getRandomVibrantColor(i);

            const outline = new Sprite(this.assetService.getOutlineTexture());
            outline.anchor.set(0.5);
            
            // Stack them: Outline on top of Pattern
            cardUnit.addChild(pattern);
            cardUnit.addChild(outline);

            // Playfulness: Add a tiny random rotation to each card
            cardUnit.x = this.STACK_A_X;
            cardUnit.y = this.STACK_Y - (i * this.Y_OFFSET);
            cardUnit.rotation = (Math.random() - 0.5) * 0.5;

            this._stackA.push(cardUnit);
            this.addChild(cardUnit); // Added to container: higher index = visually on top
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
    public getNextCardFromA(): Container | undefined {
        return this._stackA.pop();
    }

    /**
     * Logic for landing a card in Stack B
     */
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
    public get stackBLength(): number { return this._stackB.length; }
}