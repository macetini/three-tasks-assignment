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
                    // When the very last card lands...
                    if (index === cards.length - 1) {
                        this.playDeckSettlingEffect();
                    }
                }
            });
        });
    }

    /**
     * A physical "impact" effect once the deck is full.
     * Squashes the stack and then bounces it back to simulate weight.
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
     * Starts the stacking sequence of cards from stack A to stack B.
     * The sequence will repeat indefinitely until stack A is empty.
     * When stack A is empty, the sequence will be killed.
     * The delay between each card move is defined by GameConfig.CARDS.DELAY_SEC.
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
     * Celebratory effect triggered once all 144 cards have moved.
     * Uses a radial "pop" and a gentle float to signal completion.
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
     * Moves the top card from stack A to stack B.
     * If stack A is empty, logs a debug message and does nothing.
     * Otherwise, removes the top card from stack A, adds it to stack B, and tweens it to its new position.
     * The card's rotation is slightly randomized on each move.
     * The duration of the tween is defined by GameConfig.CARDS.DURATION_SEC.
     */
    public moveTopCardToTargetStack(fromStack: Container, toStack: Container): void {
        if (fromStack.children.length === 0) return;

        const card = fromStack.children.at(-1) as Sprite;
        if (!card) {
            console.warn("[AceOfShadowsView] Trying to move a card that doesn't exist.");
            return;
        }

        gsap.killTweensOf(card);

        // 1. Capture Global Position        
        const globalPos = fromStack.toGlobal(new Point(card.x, card.y));

        // 2. Move to Animation Layer (The Top Layer)
        this.animationLayer.addChild(card);

        // 3. Set Local Position in Animation Layer
        const layerPos = this.animationLayer.toLocal(globalPos);
        card.position.set(layerPos.x, layerPos.y);

        const targetY = -(toStack.children.length) * this.cfg.Y_CARD_OFFSET;

        gsap.to(card, {
            x: toStack.x, // Move toward the target stack's x
            y: toStack.y + targetY, // Move toward the target stack's y + offset
            rotation: (Math.random() - 0.5) * this.cfg.ROTATION_VARIANCE,
            duration: this.cfg.DURATION_SEC,
            ease: "sine.inOut",
            onComplete: () => {
                // 4. On landing, move the card to the final destination stack
                // This puts it back into the stack's local coordinate system
                toStack.addChild(card);
                card.position.set(0, targetY);
            }
        });
    }
}