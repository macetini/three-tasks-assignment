// src/core/mvcs/view/components/meta/IFlameParticle.ts
import type { Sprite } from "pixi.js";

/**
 * Interface representing the state of a single particle within the flame effect.
 * This structure is used by the PhoenixFlameView to track the lifecycle and 
 * physics-based movement of each flame sprite.
 */
export interface IFlameParticle {
    /** The visual representation of the particle on the PixiJS stage. */
    sprite: Sprite;

    /** * Current normalized life of the particle (1.0 to 0.0). 
     * Used to drive alpha, scale, and tint transitions.
     */
    life: number;

    /** The vertical velocity multiplier for this specific particle. */
    speed: number;

    /** * The horizontal anchor point used for the swaying animation. 
     * Drives the 'drift' logic when the emitter moves.
     */
    xOffset: number;
}