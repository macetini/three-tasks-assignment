import { gsap } from 'gsap';
import { Container, Point, Sprite } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class AceOfShadowsView extends AbstractView {
    private readonly CONTENT_SCALER = 1000;

    private readonly CARD_GAP = 500;
    private readonly CARD_ROTATION = 0.5;

    private readonly Y_CONTENT_OFFSET = 100;
    private readonly Y_CARD_OFFSET = 2; // Offset for the stacking effect

    private readonly ANIMATION_DURATION: number = 2; // 2 seconds
    private readonly ANIMATION_DELAY: number = 1; //1 second

    private readonly stackA = new Container();
    private readonly stackB = new Container();

    protected readonly scalableContent = new Container();
    private readonly cards: Sprite[] = [];

    private sequence: gsap.core.Timeline | null = null;
    private readonly tempPoint = new Point();

    public override init(): void {
        super.init();

        this.addChild(this.scalableContent);

        this.stackA.position.set(this.CARD_GAP * -0.5, this.Y_CONTENT_OFFSET);
        this.stackB.position.set(this.CARD_GAP * 0.5, this.Y_CONTENT_OFFSET);

        this.scalableContent.addChild(this.stackA, this.stackB);
    }

    public override layout(width: number, height: number): void {
        this.scalableContent.position.set(width * 0.5, height * 0.5);

        const scale = Math.min(width / this.CONTENT_SCALER, height / this.CONTENT_SCALER);
        this.scalableContent.scale.set(scale);

        console.log(`[AceOfShadowsView] Using custom layout. Layout scaled to ${scale}.`);
    }

    public populateStack(cards: Sprite[]): void {
        cards.forEach((card, index) => {
            card.anchor.set(0.5);
            card.y = -(index * this.Y_CARD_OFFSET);
            card.rotation = (Math.random() - 0.5) * this.CARD_ROTATION;

            this.cards.push(card);
            this.stackA.addChild(card);
        })
    }

    public startStackingSequence(): void {
        this.sequence?.kill();

        this.sequence = gsap.timeline({ repeat: -1 });
        this.sequence.call(() => {
            if (this.stackA.children.length > 0) {
                this.moveTopCardToStackB();
            } else {
                this.sequence?.kill();
            }
        }, [], this.ANIMATION_DELAY);
    }

    public stopSequence(): void {
        this.sequence?.kill();
    }

    public moveTopCardToStackB(): void {
        const { stackA, stackB } = this;
        if (stackA.children.length === 0) {
            console.log(`[AceOfShadowsView] Stack A is empty.`);
            return;
        }

        const card = stackA.children.at(-1) as Container;

        // OPTIMIZATION: Using the 'out' parameter in getGlobalPosition and toLocal 
        // reuses the memory of _tempPoint instead of creating 2 new Point objects per second.
        card.getGlobalPosition(this.tempPoint);
        stackB.addChild(card);
        stackB.toLocal(this.tempPoint, undefined, this.tempPoint);

        card.position.set(this.tempPoint.x, this.tempPoint.y);

        const targetY = -(stackB.children.length - 1) * this.Y_CARD_OFFSET;

        gsap.to(card, {
            x: 0,
            y: targetY,
            duration: this.ANIMATION_DURATION,
            ease: "sine.inOut",
            overwrite: "auto",
        });
    }

}