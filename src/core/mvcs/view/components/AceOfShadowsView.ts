import { gsap } from 'gsap';
import { Container, Point, Sprite } from 'pixi.js';
import { GameConfig } from '../../../config/GameConfig';
import { AbstractView } from '../AbstractView';

export class AceOfShadowsView extends AbstractView {
    public static readonly CARD_BACK_CLICK_EVENT = 'card_back_click_event';

    private readonly cfg = GameConfig.CARDS;

    private readonly stackA = new Container();
    private readonly stackB = new Container();

    protected readonly scalableContent = new Container();
    private readonly cards: Sprite[] = [];

    private sequence: gsap.core.Timeline | null = null;
    private readonly tempPoint = new Point();

    public override init(): void {
        super.init();
        this.addChild(this.scalableContent);

        this.stackA.position.set(this.cfg.GAP * -0.5, this.cfg.Y_CONTENT_OFFSET);
        this.stackB.position.set(this.cfg.GAP * 0.5, this.cfg.Y_CONTENT_OFFSET);

        this.scalableContent.addChild(this.stackA, this.stackB);
    }

    public override layout(width: number, height: number): void {
        this.scalableContent.position.set(width * 0.5, height * 0.5);

        const scale = Math.min(width / this.cfg.CONTENT_SCALER, height / this.cfg.CONTENT_SCALER);
        this.scalableContent.scale.set(scale);

        console.debug(`[AceOfShadowsView] Using custom layout. Layout scaled to ${scale}.`);
    }

    public populateStack(cards: Sprite[]): void {
        cards.forEach((card, index) => {
            card.anchor.set(0.5);
            card.y = -(index * this.cfg.Y_CARD_OFFSET);
            card.rotation = (Math.random() - 0.5) * this.cfg.ROTATION_VARIANCE;

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
        }, [], this.cfg.DELAY_SEC);
    }

    public stopStackingSequence(): void {
        this.sequence?.kill();
        this.sequence = null;

        this.cards.forEach(card => {
            gsap.killTweensOf(card);
        });
        this.cards.length = 0;
    }

    public moveTopCardToStackB(): void {
        const { stackA, stackB } = this;

        if (stackA.children.length === 0) {
            console.debug(`[AceOfShadowsView] Stack A is empty.`);
            return;
        }

        const card = stackA.children.at(-1) as Container;
        card.getGlobalPosition(this.tempPoint);

        stackB.addChild(card);
        stackB.toLocal(this.tempPoint, undefined, this.tempPoint);

        card.position.set(this.tempPoint.x, this.tempPoint.y);

        const targetY = -(stackB.children.length - 1) * this.cfg.Y_CARD_OFFSET;

        gsap.killTweensOf(card); // Clean up previous tween
        gsap.to(card, {
            x: 0,
            y: targetY,
            rotation: (Math.random() - 0.5) * this.cfg.ROTATION_VARIANCE, // Slightly change rotation on move
            duration: this.cfg.DURATION_SEC,
            ease: "sine.inOut",
            overwrite: "auto",
        });
    }

}