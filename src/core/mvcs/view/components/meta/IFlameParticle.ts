// src/core/mvcs/view/components/meta/IFlameParticle.ts
import type { Sprite } from "pixi.js";

/**
 * Interface representing a single flame particle's state.
 */
export interface IFlameParticle {
    sprite: Sprite;
    life: number;
    speed: number;
    xOffset: number;
}