// src/core/mvcs/model/states/FlameModel.ts
import type { Texture } from "pixi.js";

/**
 * Domain Model for the Phoenix Flame feature.
 * * This model stores the procedurally generated texture used by the 
 * particle system. By centralizing the texture here, we ensure that 
 * the expensive baking process only happens once.
 */
export class FlameModel {
    public static readonly NAME = "FlameModel";

    /**
     * Internal reference to the procedural flame texture.
     * Initialized via PrepareFlameCommand.
     */
    private _flameTexture!: Texture;

    /**
     * Sets the flame texture to be used for the flame effect.
     * This method is called by the PrepareFlameCommand after the flame texture has been generated.
     * 
     * @param texture - The flame texture to set.
     */
    public setFlameTexture(texture: Texture): void {
        this._flameTexture = texture;
    }

    /**
     * Returns the currently set flame texture.
     * If no flame texture has been set, an empty Texture is returned.
     * 
     * @returns The flame texture.
     */
    public get flameTexture(): Texture {
        return this._flameTexture;
    }
}