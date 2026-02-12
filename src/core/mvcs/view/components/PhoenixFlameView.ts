// src/core/mvcs/view/components/PhoenixFlameView.ts
import { Rectangle, Sprite, Texture } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class PhoenixFlameView extends AbstractView {
    private readonly particles: Array<{ sprite: Sprite; life: number; speed: number; xOffset: number }> = [];
    private readonly MAX_PARTICLES = 10;
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
            p.life -= 0.008 * delta * p.speed;

            p.sprite.y -= p.speed * delta * 2.5;
            p.sprite.x = p.xOffset + Math.sin(p.sprite.y * 0.05) * 15;

            const size = Math.sin(p.life * Math.PI) * 2.5;
            p.sprite.scale.set(size + (Math.random() * 0.1)); // Slight flicker

            p.sprite.alpha = p.life;

            if (p.life > 0.6) {
                p.sprite.tint = 0xFFFFCC; // White hot base
            } else if (p.life > 0.3) {
                p.sprite.tint = 0xFF8800; // Orange core
            } else {
                p.sprite.tint = 0xAA0000; // Cooling red embers
            }

            if (p.life <= 0) {
                this.resetParticle(p);
            }
        });
    }

    private resetParticle(p: any): void {
        p.life = 1;
        // Particles spawn at the emitter position with a slight random spread
        p.xOffset = this.emitterPos.x + (Math.random() - 0.5) * 30;
        p.sprite.x = p.xOffset;
        p.sprite.y = this.emitterPos.y;
        p.speed = 1 + Math.random() * 1.5;
    }

    public override layout(width: number, height: number): void {
        // 1. Reset container to top-left (0,0) so it doesn't offset anything else
        this.position.set(0, 0);

        // 2. The hitArea is now simply the whole screen
        this.hitArea = new Rectangle(0, 0, width, height);

        // 3. Set the default emitter position to bottom-center of the screen
        if (this.emitterPos.x === 0 && this.emitterPos.y === 0) {
            this.setEmitterPosition(width * 0.5, height * 0.85);
        }
    }
    private onPointerHandler(event: any): void {
        const localPos = event.getLocalPosition(this);
        this.setEmitterPosition(localPos.x, localPos.y);
    }

    public setEmitterPosition(x: number, y: number): void {
        this.emitterPos.x = x;
        this.emitterPos.y = y;
    }
}