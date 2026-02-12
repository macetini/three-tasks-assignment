// src/core/mvcs/view/components/PhoenixFlameView.ts
import { Point, Rectangle, Sprite, Texture } from 'pixi.js';
import { AbstractView } from '../AbstractView';
import type { IFlameParticle } from './meta/IFlameParticle';

/**
 * View responsible for the "Phoenix Flame" effect.
 * Uses an object pooling strategy to maintain exactly 10 sprites.
 */
export class PhoenixFlameView extends AbstractView {

    private readonly MAX_PARTICLES = 10;
    private readonly FLAME_BASE_COLOR = 0xFFFFCC; // White hot base
    private readonly FLAME_CORE_COLOR = 0xFF8800; // Orange core
    private readonly FLAME_EMBERS_COLOR = 0xAA0000; // Cooling red embers            
    private readonly FLAME_BLEND_MODE = 'add';

    private readonly tempPoint = new Point(); // PRE-ALLOCATED: No GC on mouse move
    private readonly PI = Math.PI; // Cached PI

    private readonly particles: IFlameParticle[] = [];
    private fireTexture!: Texture;

    private readonly emitterPos = { x: 0, y: 0 };

    /**
     * Initializes the PhoenixFlameView.
     * Sets the event mode to 'static' and adds event listeners for pointer movement and pointer down events.
     */
    public override init(): void {
        super.init();

        this.eventMode = 'static';

        this.on('pointermove', this.onPointerHandler, this);
        this.on('pointerdown', this.onPointerHandler, this);
    }

    /**
     * Removes all event listeners and cleans up the view for garbage collection.
     * Should be called when the view is no longer needed.
     */
    public override dispose(): void {
        super.dispose();

        this.off('pointermove', this.onPointerHandler, this);
        this.off('pointerdown', this.onPointerHandler, this);

        // Clear references for GC
        this.particles.length = 0;
    }
   
    /**
     * Initializes the flame effect by creating MAX_PARTICLES sprites from the given texture.
     * Each sprite is given a random life, speed, and x offset to create a staggered start.
     * The sprites are then added to the view and stored in the particles array.
     * 
     * @param texture - Texture to use for the flame effect.
     */
    public setupFire(texture: Texture): void {
        this.fireTexture = texture;

        for (let i = 0; i < this.MAX_PARTICLES; i++) {
            const sprite = new Sprite(this.fireTexture);
            sprite.anchor.set(0.5);
            sprite.blendMode = this.FLAME_BLEND_MODE; // Additive blending creates the white-hot core

            const particle: IFlameParticle = {
                sprite,
                life: Math.random(), // Staggered start so particles don't sync
                speed: 1 + Math.random() * 1.5,
                xOffset: 0
            };

            this.resetParticle(particle);
            this.addChild(sprite);
            this.particles.push(particle);
        }
    }

    /**
     * Updates the flame particles based on the time delta.
     * Adjusts position, scale, tint, alpha, and rotation for each particle.
     * Particles are reset when their life reaches zero.
     * 
     * @param delta - Time difference in milliseconds since the last frame update.
     */
    public update(delta: number): void {
        const driftForce = 0.008 * delta;
        // Classic loop for performance
        const particlesLength = this.particles.length;
        for (let i = 0; i < particlesLength; i++) {
            const particle = this.particles[i];
            particle.life -= driftForce * particle.speed;

            particle.sprite.y -= particle.speed * delta * 2.5;
            particle.sprite.x = particle.xOffset + Math.sin(particle.sprite.y * 0.05) * 15;

            const size = Math.sin(particle.life * this.PI) * 2.5;
            particle.sprite.scale.set(size);

            particle.sprite.alpha = particle.life;

            if (particle.life > 0.6) {
                particle.sprite.tint = this.FLAME_BASE_COLOR; // White hot base
            } else if (particle.life > 0.3) {
                particle.sprite.tint = this.FLAME_CORE_COLOR; // Orange core
            } else {
                particle.sprite.tint = this.FLAME_EMBERS_COLOR; // Cooling red embers
            }

            particle.sprite.rotation = Math.cos(particle.sprite.y * 0.05) * 0.2;

            if (particle.life <= 0) {
                this.resetParticle(particle);
            }
        }
    }

    /**
     * Resets a flame particle to its default state.
     * Particles are given a new random life, speed, and x offset to create a natural spread.
     * This method is called when a particle's life reaches zero.
     * 
     * @param particle - The particle to reset.
     */
    private resetParticle(particle: any): void {
        particle.life = 1;
        // Particles spawn at the emitter position with a slight random spread
        particle.xOffset = this.emitterPos.x + (Math.random() - 0.5) * 30;
        particle.sprite.x = particle.xOffset;
        particle.sprite.y = this.emitterPos.y;
        particle.speed = 1 + Math.random() * 1.5;
    }

    /**
     * Called by the Mediator or Parent during the render phase.
     * Positions the emitter at the center of the screen (50%, 85%).
     * If the emitter position has not been set by interaction, it sets a default value.
     * 
     * @param width Width of the screen
     * @param height Height of the screen
     */
    public override layout(width: number, height: number): void {
        this.position.set(0, 0);

        this.hitArea = new Rectangle(0, 0, width, height);

        // Default position if not yet set by interaction
        if (this.emitterPos.x === 0 && this.emitterPos.y === 0) {
            this.setEmitterPosition(width * 0.5, height * 0.85);
        }

        // Too much logging (enable if needed)
        //console.debug(`[PhoenixFlameView] Using responsive layout. View positioned at (${this.x}, ${this.y})`);
    }

    /**
     * Updates the emitter position based on the mouse pointer.
     */
    private onPointerHandler(event: any): void {
        event.getLocalPosition(this, this.tempPoint);
        this.setEmitterPosition(this.tempPoint.x, this.tempPoint.y);
    }

    /**
     * Updates the emitter position.
     */
    public setEmitterPosition(x: number, y: number): void {
        this.emitterPos.x = x;
        this.emitterPos.y = y;
    }
}