import { Color, Container, Sprite, Texture } from 'pixi.js';
import { gsap } from 'gsap';
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

        console.log(`[${this.constructor.name}] Scaling content to: ${scale}`);
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

    public moveTopCardToStackB(): void {
        if (this.stackA.children.length === 0) return;

        // 2. Pick the top card (last child in PIXI)
        const card = this.stackA.children[this.stackA.children.length - 1] as Container;

        // 3. The "Teleport" Trick:
        // Before we change the parent, get where the card is on the ACTUAL screen.
        const globalPos = card.getGlobalPosition();

        // 4. Change Parent
        this.stackB.addChild(card);

        // 5. Calculate where that screen position is INSIDE stackB's local world
        const localPos = this.stackB.toLocal(globalPos);

        // 6. Set the card to that local position so it hasn't visually moved yet
        card.position.set(localPos.x, localPos.y);

        // 7. GSAP Animation
        // Now we animate it from its current "weird" local position back to (0, targetY)
        const isPortrait = this.stackB.x < 300;
        const offset = isPortrait ? 2 : 1.2;
        const targetY = -(this.stackB.children.length - 1) * offset;

        gsap.to(card, {
            x: 0,
            y: targetY,
            duration: 2, // 2-second flight as per common task requirements
            ease: "sine.inOut",
            overwrite: "auto", // Prevents animation conflicts if user goes crazy
        });
    }

    public getStackACount(): number {
        return this.stackA.children.length;
    }
}