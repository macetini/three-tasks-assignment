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

    public override init(): void {
        super.init();

        this.eventMode = 'static';

        this.on('pointermove', this.onPointerHandler, this);
        this.on('pointerdown', this.onPointerHandler, this);
    }

    public override dispose(): void {
        super.dispose();

        this.off('pointermove', this.onPointerHandler, this);
        this.off('pointerdown', this.onPointerHandler, this);

        // Clear references for GC
        this.particles.length = 0;
    }

    /**
     * Initializes the particle pool once the procedural texture is ready.
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
     * 
     * Main animation loop for the fire effect.
     * 
     * @param delta - Normalized ticker delta
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
     * 
     * Resets the particle state.
     * 
     * @param particle - Particle to reset
     */
    private resetParticle(particle: any): void {
        particle.life = 1;
        // Particles spawn at the emitter position with a slight random spread
        particle.xOffset = this.emitterPos.x + (Math.random() - 0.5) * 30;
        particle.sprite.x = particle.xOffset;
        particle.sprite.y = this.emitterPos.y;
        particle.speed = 1 + Math.random() * 1.5;
    }

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