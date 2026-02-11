// src/core/mvcs/view/components/PhoenixFlameView.ts
import { Rectangle, Sprite, Texture } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class PhoenixFlameView extends AbstractView {
    private readonly particles: Array<{ sprite: Sprite; life: number; speed: number; xOffset: number }> = [];
    private readonly MAX_PARTICLES = 10;
    private fireTexture!: Texture;

    private emitterPos = { x: 0, y: 0 };

    public override init(): void {
        super.init();

        // 1. Enable interaction on the view itself
        this.eventMode = 'static';

        // 2. Setup listeners
        this.on('pointermove', this.onPointerHandler, this);
        this.on('pointerdown', this.onPointerHandler, this);
    }

    private onPointerHandler(event: any): void {
        // Get the position relative to this container
        const localPos = event.getLocalPosition(this);
        this.setEmitterPosition(localPos.x, localPos.y);
    }

    public setupFire(texture: Texture): void {
        this.fireTexture = texture;

        for (let i = 0; i < this.MAX_PARTICLES; i++) {
            const sprite = new Sprite(this.fireTexture);
            sprite.anchor.set(0.5);
            sprite.blendMode = 'add'; // Essential for the "glow" overlap

            const particle = {
                sprite,
                life: Math.random(), // Staggered start
                speed: 1 + Math.random() * 1.5,
                xOffset: (Math.random() - 0.5) * 40
            };

            this.resetParticle(particle);
            this.addChild(sprite);
            this.particles.push(particle);
        }
    }

    public update(delta: number): void {
        this.particles.forEach(p => {
            // 1. Progress life (0 to 1)
            p.life -= 0.008 * delta * p.speed;

            // 2. Movement: Rise up and wiggle
            p.sprite.y -= p.speed * delta * 2.5;
            p.sprite.x = p.xOffset + Math.sin(p.sprite.y * 0.05) * 15;

            // 3. Scaling: Start small, grow in middle (heat expansion), shrink at top
            const size = Math.sin(p.life * Math.PI) * 2.5;
            p.sprite.scale.set(size + (Math.random() * 0.1)); // Slight flicker

            // 4. Alpha & Color Life-cycle
            p.sprite.alpha = p.life;

            // Senior Tip: White/Yellow base, fading to Orange/Red
            if (p.life > 0.6) {
                p.sprite.tint = 0xFFFFCC; // White hot base
            } else if (p.life > 0.3) {
                p.sprite.tint = 0xFF8800; // Orange core
            } else {
                p.sprite.tint = 0xAA0000; // Cooling red embers
            }

            // 5. Recycle
            if (p.life <= 0) {
                this.resetParticle(p);
            }
        });
    }

    // Update your resetParticle to use the emitterPos
    private resetParticle(p: any): void {
        p.life = 1.0;
        // Particles spawn at the emitter position with a slight random spread
        p.xOffset = this.emitterPos.x + (Math.random() - 0.5) * 30;
        p.sprite.x = p.xOffset;
        p.sprite.y = this.emitterPos.y;
        p.speed = 1 + Math.random() * 1.5;
    }

    public override layout(width: number, height: number): void {
        // 3. Define a hitArea so we can catch events even where there are no particles
        // We make it cover the whole screen so you can drag anywhere
        this.hitArea = new Rectangle(-width / 2, -height * 0.85, width, height);

        // Initial emitter position (relative to the view's 0,0)
        if (this.emitterPos.x === 0 && this.emitterPos.y === 0) {
            this.setEmitterPosition(0, 0);
        }

        // Position the whole container
        this.position.set(width * 0.5, height * 0.85);
    }

    public setEmitterPosition(x: number, y: number): void {
        this.emitterPos.x = x;
        this.emitterPos.y = y;
    }
}