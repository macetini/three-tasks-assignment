// src/core/mvcs/view/components/PhoenixFlameView.ts
import { Sprite, Texture } from 'pixi.js';
import { AbstractView } from '../AbstractView';

export class PhoenixFlameView extends AbstractView {
    private readonly particles: Array<{ sprite: Sprite; life: number; speed: number }> = [];
    private readonly MAX_PARTICLES = 10;
    private fireTexture!: Texture;

    public override init(): void {
        super.init(); // Adds the back button automatically
    }

    public setupFire(texture: Texture): void {
        this.fireTexture = texture;
        for (let i = 0; i < this.MAX_PARTICLES; i++) {
            const sprite = new Sprite(this.fireTexture);
            sprite.anchor.set(0.5);
            sprite.blendMode = 'add';

            const particle = { sprite, life: Math.random(), speed: 1 + Math.random() * 2 };
            this.resetParticle(particle);

            this.addChild(sprite);
            this.particles.push(particle);
        }
    }

    public update(delta: number): void {
        this.particles.forEach(p => {
            p.life -= 0.01 * delta * p.speed;
            p.sprite.y -= p.speed * delta * 2;
            p.sprite.x += Math.sin(p.sprite.y * 0.1) * 0.5;

            const scale = Math.sin(p.life * Math.PI) * 2;
            p.sprite.scale.set(scale);
            p.sprite.alpha = p.life;
            p.sprite.tint = p.life > 0.5 ? 0xFFFFFF : 0xFF4400;

            if (p.life <= 0) this.resetParticle(p);
        });
    }

    private resetParticle(p: any): void {
        p.life = 1;
        p.sprite.position.set((Math.random() - 0.5) * 40, 0);
    }
}