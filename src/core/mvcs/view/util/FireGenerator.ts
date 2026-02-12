// src/core/mvcs/view/util/FireGenerator.ts
import { Graphics, Texture, type Renderer } from "pixi.js";

export class FireGenerator {
    /**
     * Generates a procedural "Flame Petal" texture.
     * It's a teardrop shape with a radial alpha gradient.
     */
    public generateFlameTexture(renderer: Renderer): Texture {
        const graphics = new Graphics();
        const size = 64;

        // We draw multiple layers to create a "soft" feel without external assets
        // Layer 1: The outer soft glow (large, very transparent)
        graphics.circle(size * 0.5, size * 0.5, size * 0.5)
            .fill({ color: 0xffffff, alpha: 0.2 });

        // Layer 2: The "Core" teardrop shape
        // We use a bit of math to make it narrower at the top
        graphics.moveTo(size * 0.5, size * 0.2) // Top tip
            .bezierCurveTo(
                size * 0.8, size * 0.4, // Right curve
                size * 0.9, size * 0.9, // Bottom right
                size / 2, size * 0.95   // Bottom center
            )
            .bezierCurveTo(
                size * 0.1, size * 0.9, // Bottom left
                size * 0.2, size * 0.4, // Left curve
                size / 2, size * 0.2    // Back to tip
            )
            .fill({ color: 0xffffff, alpha: 0.8 });

        const texture = renderer.generateTexture({
            target: graphics,
            resolution: 2, // Keep it sharp
            antialias: true
        });

        graphics.destroy();
        return texture;
    }
}