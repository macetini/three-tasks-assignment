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

    private readonly animationLayer = new Container();

    /**
     * Initializes the Ace of Shadows view by adding the scalable content to the view,
     * setting the positions of the two card stacks, and adding the stacks to the content.
     */
    public override init(): void {
        super.init();
        this.addChild(this.scalableContent);

        this.stackA.position.set(this.cfg.GAP * -0.5, this.cfg.Y_CONTENT_OFFSET);
        this.stackB.position.set(this.cfg.GAP * 0.5, this.cfg.Y_CONTENT_OFFSET);

        this.scalableContent.addChild(this.stackA, this.stackB, this.animationLayer);
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
     * Each sprite is initially positioned at the center of the screen with an alpha of 0.
     * The sprites are then animated to their final positions with a easing function.
     * The animation is staggered by a small amount to create a "settle" effect.
     * When the animation is complete, the playDeckSettlingEffect method is called.
     * 
     * @param cards - The array of sprites to populate the stack with.
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
                        this.playDeckSettlingEffect();
                    }
                }
            });
        });
    }


    /**
     * Play a settling animation on the deck stack after it has been populated.
     * This animation is a slight bulge and squash effect to give the impression that the deck is settling.
     * Once the animation has finished, the actual task sequence is started.
     */
    private playDeckSettlingEffect(): void {
        gsap.to(this.stackA.scale, {
            x: 1.05, // Slight bulge
            y: 0.92, // Slight squash
            duration: 0.1,
            yoyo: true, // Snap back to 1.0
            repeat: 1,
            ease: "sine.in",
            onComplete: () => {
                // Settle: Bounces back to normal size
                // Now start the actual task sequence
                this.startStackingSequence(this.stackA, this.stackB);
            }
        });
    }


    /**
     * Starts the stacking sequence for the Ace of Shadows task.
     * This sequence is responsible for animating the movement of cards between two stacks.
     * The sequence is infinite and will continue to loop until it is manually killed.
     * The sequence is composed of two parts: the first part moves the top card from the source stack to the target stack,
     * and the second part plays a finale animation once all cards have been moved.
     * The finale animation is a radial "pop" and a gentle float to signal completion.
     * Once the finale has finished, the stacks are swapped and the sequence is restarted.
     * 
     * @param fromStack The source stack to move cards from.
     * @param toStack The target stack to move cards to.
     */
    public startStackingSequence(fromStack: Container, toStack: Container): void {
        console.debug("[AceOfShadowsView] Stacking Sequence Started.");
        this.sequence?.kill();
        this.sequence = gsap.timeline({ repeat: -1 });

        this.sequence.call(() => {
            if (fromStack.children.length > 0) {
                this.moveTopCardToTargetStack(fromStack, toStack);
            } else {
                this.sequence?.kill();
                // The Finale plays, then we swap and restart                
                this.playTaskCompleteFinale(fromStack, toStack);
            }
        }, [], this.cfg.DELAY_SEC);
    }


    /**
     * Plays the finale animation for the Ace of Shadows task.
     * This animation is triggered once all cards have been moved from the source stack to the target stack.
     * The animation consists of a squash and stretch of the final stack, followed by a bouncy leap and a final settle.
     * Once the animation has finished, the stacking sequence is restarted with the stacks swapped.
     * 
     * @param originStack The source stack that the cards were moved from.
     * @param targetStack The target stack that the cards were moved to.
     */
    private playTaskCompleteFinale(originStack: Container, targetStack: Container): void {
        const finaleTl = gsap.timeline({
            onComplete: () => {
                this.startStackingSequence(targetStack, originStack);
            }
        });

        // 1. Squash and Stretch the final stack
        finaleTl.to(targetStack.scale, {
            x: 1.1,
            y: 0.8,
            duration: 0.15,
            ease: "power2.in"
        });
        finaleTl.to(targetStack, {
            y: this.cfg.Y_CONTENT_OFFSET - 40, // Relative leap from its ground position
            duration: 0.4,
            yoyo: true,
            repeat: 1,
            ease: "back.out(2)"
        });
        finaleTl.to(targetStack.scale, {
            x: 1,
            y: 1,
            duration: 0.6,
            ease: "elastic.out(1.1, 0.3)"
        }, "-=0.4"); // Overlap with the leap
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
     * Moves the top card from the source stack to the target stack.
     * This function first captures the global position of the card in the source stack,
     * then moves the card to the animation layer (the top layer) and sets its local position.
     * Finally, it animates the card to the target stack's position (with a random rotation),
     * and on completion, moves the card to the final destination stack.
     * 
     * @param fromStack The source stack to move the card from.
     * @param toStack The target stack to move the card to.
    */
    public moveTopCardToTargetStack(fromStack: Container, toStack: Container): void {
        if (fromStack.children.length === 0) return;

        const card = fromStack.children.at(-1) as Sprite;
        if (!card) {
            console.warn("[AceOfShadowsView] Trying to move a card that doesn't exist.");
            return;
        }

        gsap.killTweensOf(card);

        const globalPos = fromStack.toGlobal(new Point(card.x, card.y));

        this.animationLayer.addChild(card);

        const layerPos = this.animationLayer.toLocal(globalPos);
        card.position.set(layerPos.x, layerPos.y);

        const targetY = -(toStack.children.length) * this.cfg.Y_CARD_OFFSET;

        gsap.to(card, {
            x: toStack.x,
            y: toStack.y + targetY,
            rotation: (Math.random() - 0.5) * this.cfg.ROTATION_VARIANCE,
            duration: this.cfg.DURATION_SEC,
            ease: "sine.inOut",
            onComplete: () => {
                toStack.addChild(card);
                card.position.set(0, targetY);
            }
        });
    }
}