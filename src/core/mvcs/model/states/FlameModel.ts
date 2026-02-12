// src/core/mvcs/model/states/FlameModel.ts
import type { Texture } from "pixi.js";

export class FlameModel {
    public static readonly NAME = "FlameModel";

    private _flameTexture!: Texture;

    public setFlameTexture(texture: Texture): void {
        this._flameTexture = texture;
    }

    public get flameTexture(): Texture {
        return this._flameTexture;
    }
}