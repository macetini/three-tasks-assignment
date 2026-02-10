import { Color, Container, Point, RenderGroup, Sprite, Texture } from 'pixi.js';
import { gsap } from 'gsap';
import { AbstractView } from '../AbstractView';

export class AceOfShadowsView extends AbstractView {
    private readonly Y_OFFSET = 2; // Offset for the stacking effect

    private readonly stackA = new Container();
    private readonly stackB = new Container();

    private readonly cards: Sprite[] = [];
    protected readonly content = new Container();
    private readonly tempPoint = new Point();

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

        //console.log(`[${this.constructor.name}] Scaling content to: ${scale}`);
    }

    public populateDeck(cards: Sprite[]): void {
        cards.forEach((card, index) => {
            this.cards.push(card);

            card.anchor.set(0.5);

            card.y = -(index * this.Y_OFFSET);
            card.rotation = (Math.random() - 0.5) * 0.5;

            this.stackA.addChild(card);
        })
    }

    public moveTopCardToStackB(): void {
        const { stackA, stackB } = this;
        if (stackA.children.length === 0) return;

        const card = stackA.children[stackA.children.length - 1] as Container;

        // OPTIMIZATION: Using the 'out' parameter in getGlobalPosition and toLocal 
        // reuses the memory of _tempPoint instead of creating 2 new Point objects per second.
        card.getGlobalPosition(this.tempPoint);
        stackB.addChild(card);
        stackB.toLocal(this.tempPoint, undefined, this.tempPoint);

        card.position.set(this.tempPoint.x, this.tempPoint.y);

        const targetY = -(stackB.children.length - 1) * this.Y_OFFSET;

        gsap.to(card, {
            x: 0,
            y: targetY,
            duration: 2,
            ease: "sine.inOut",
            overwrite: "auto",
        });
    }

    public getStackACount(): number {
        return this.stackA.children.length;
    }
}