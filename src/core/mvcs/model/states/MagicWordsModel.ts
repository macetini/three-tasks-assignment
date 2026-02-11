// src/core/mvcs/model/states/MagicWordsModel.ts
import type { Texture } from "pixi.js";
import { GameConfig } from "../../../config/GameConfig";
import type { MagicWordVO } from "./vo/MagicWordVO";

export type AvatarPosition = "left" | "right";

export class MagicWordsModel {
    public static readonly NAME = "magicWordsModel";

    private _words: MagicWordVO[] = [];
    private readonly _positions: Map<string, AvatarPosition> = new Map();

    private _textureMap: Map<string, Texture> = new Map();

    /**
     * Called by FetchMagicWordsCommand to store the metadata from JSON
     */
    public setAvatarData(avatars: { name: string, position: string }[]): void {
        avatars.forEach(avatar => {
            this._positions.set(avatar.name, avatar.position as AvatarPosition);
        });
    }

    public getPosition(characterName: string): AvatarPosition {
        return this._positions.get(characterName) || GameConfig.WORDS.DEFAULT_AVATAR_POSITION;
    }

    public setData(data: MagicWordVO[]): void {
        this._words = data;
    }

    public get words(): MagicWordVO[] {
        return this._words;
    }

    public setTextures(map: Map<string, Texture>): void {
        this._textureMap = map;
    }

    public getTexture(id: string): Texture {
        return this._textureMap.get(id) || this._textureMap.get("default")!;
    }
}