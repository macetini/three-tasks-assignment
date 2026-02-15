import { gsap } from 'gsap';
import { Container, Point, Sprite } from 'pixi.js';
import { GameConfig } from '../../../config/GameConfig';
import { TaskView } from '../TaskView';

/**
 * View responsible for the Ace of Shadows card stacking animation.
 * Handles the coordinated movement of 144 cards between two stacks
 * with responsive scaling and smooth GSAP transitions.
 */
export class AceOfShadowsView extends TaskView {
    public static readonly CARD_BACK_CLICK_EVENT = 'cardBackClickEvent';

    private readonly cfg = GameConfig.CARDS;

    private readonly stackA = new Container();
    private readonly stackB = new Container();

    protected readonly scalableContent = new Container();
    private readonly cards: Sprite[] = [];

    private sequence: gsap.core.Timeline | null = null;
    private readonly tempPoint = new Point();

    /**
     * Initializes the Ace of Shadows view by adding the scalable content to the view,
     * setting the positions of the two card stacks, and adding the stacks to the content.
     */
    public override init(): void {
        super.init();
        this.addChild(this.scalableContent);

        this.stackA.position.set(this.cfg.GAP * -0.5, this.cfg.Y_CONTENT_OFFSET);
        this.stackB.position.set(this.cfg.GAP * 0.5, this.cfg.Y_CONTENT_OFFSET);

        this.scalableContent.addChild(this.stackA, this.stackB);
    }

    /**
     * Override to handle responsive layout.
     * Scales the content based on the minimum dimension of the screen.
     * Centers the content horizontally and vertically.
     * Logs the scale used for debugging purposes.
     * 
     * @param width The actual width available for the content.
     * @param height The actual height available for the content.
     */
    public override layout(width: number, height: number): void {
        this.scalableContent.position.set(width * 0.5, height * 0.5);

        const scale = Math.min(width / this.cfg.CONTENT_SCALER, height / this.cfg.CONTENT_SCALER);
        this.scalableContent.scale.set(scale);

        // Too much logging (enable if needed)
        //console.debug(`[AceOfShadowsView] Using custom layout. Layout scaled to ${scale}.`);
    }

    /**
     * Populates the stackA with the given array of sprites.
     * Each sprite is centered, positioned with a slight rotation and a y offset
     * based on its index in the array.
     * The sprites are also stored in the cards array for later use.
     * 
     * @param cards The array of sprites to populate the stack with.
     */
    public populateStack(cards: Sprite[]): void {
        const { Y_CARD_OFFSET, ROTATION_VARIANCE } = this.cfg;

        cards.forEach((card, index) => {
            card.anchor.set(0.5);

            const targetY = -(index * Y_CARD_OFFSET);
            const targetRotation = (Math.random() - 0.5) * ROTATION_VARIANCE;

            card.alpha = 0;
            card.position.set(this.cfg.X_Y_INITIAL_POSITION, this.cfg.X_Y_INITIAL_POSITION);
            card.rotation = Math.PI;

            this.cards.push(card);
            this.stackA.addChild(card);

            gsap.to(card, {
                x: 0,
                y: targetY,
                rotation: targetRotation,
                alpha: 1,
                duration: 0.6,
                delay: index * 0.01,
                ease: "back.out(1.2)",
                onComplete: () => {
                    if (index === cards.length - 1) {
                        this.startStackingSequence();
                    }
                }
            });
        });
    }

    /**
     * Starts the stacking sequence of cards from stack A to stack B.
     * The sequence will repeat indefinitely until stack A is empty.
     * When stack A is empty, the sequence will be killed.
     * The delay between each card move is defined by GameConfig.CARDS.DELAY_SEC.
     */
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

    /**
     * Stops the stacking sequence and cleans up all associated animations.
     * All cards currently being animated are immediately stopped and removed from the stack.
     * The sequence is then killed and reset to null.
     * The cards array is then cleared to remove all references to the cards.
     */
    public stopStackingSequence(): void {
        this.sequence?.kill();
        this.sequence = null;

        this.cards.forEach(card => {
            gsap.killTweensOf(card);
        });
        this.cards.length = 0;
    }

    /**
     * Moves the top card from stack A to stack B.
     * If stack A is empty, logs a debug message and does nothing.
     * Otherwise, removes the top card from stack A, adds it to stack B, and tweens it to its new position.
     * The card's rotation is slightly randomized on each move.
     * The duration of the tween is defined by GameConfig.CARDS.DURATION_SEC.
     */
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