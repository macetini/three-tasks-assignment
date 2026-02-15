import gsap from "gsap";
import type { Container } from "pixi.js";

/**
 * Utility class for animating card elements.
 * Provides methods for playing settling and finale animations.
 */
export class CardAnimator {
    /**
     * Plays a settling animation on the target container.
     * This animation is a slight bulge and squash effect to give the impression that the target is settling.
     * Once the animation has finished, the provided onComplete callback is triggered.
     * 
     * @param target - The container to animate.
     * @param [onComplete] - Optional callback to execute once the animation has finished.
     */

    public static playSettle(target: Container, onComplete?: () => void): void {
        gsap.to(target.scale, {
            x: 1.05, y: 0.92,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: "sine.in",
            onComplete
        });
    }


    /**
     * Plays a finale animation on the target container.
     * This animation consists of three distinct parts:
     * 1. A squash and stretch of the target container to give the impression of settling.
     * 2. A bouncy leap to give the impression of energy release.
     * 3. A final settle to bring the target back to its original state.
     * Once the animation has finished, the provided onComplete callback is triggered.
     * 
     * @param target - The container to animate.
     * @param groundY - The position on the y-axis where the target should settle.
     * @param [onComplete] - Optional callback to execute once the animation has finished.
     */
    public static playFinale(target: Container, groundY: number, onComplete?: () => void): void {
        const tl = gsap.timeline({ onComplete });

        tl.to(target.scale, { x: 1.1, y: 0.8, duration: 0.15, ease: "power2.in" });

        tl.to(target, {
            y: groundY - 40,
            duration: 0.4,
            yoyo: true,
            repeat: 1,
            ease: "sine.inOut"
        });

        tl.to(target.scale, {
            x: 1, y: 1,
            duration: 0.6,
            ease: "elastic.out(1.1, 0.3)"
        }, "-=0.4");
    }
}