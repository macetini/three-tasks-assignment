// src/core/mvcs/model/states/MagicWordsModel.ts
import type { Texture } from "pixi.js";
import { GameConfig } from "../../../config/GameConfig";
import type { MagicWordVO } from "./vo/MagicWordVO";

/**
 * Valid screen-side positions for chat avatars.
 */
export type AvatarPosition = "left" | "right";

/**
 * Domain Model for the Magic Words feature.
 * Acts as a centralized store for dialogue data, character metadata, 
 * and associated textures.
 */
export class MagicWordsModel {
    public static readonly NAME = "magicWordsModel";

    private readonly _positions: Map<string, AvatarPosition> = new Map();

    private _words: MagicWordVO[] = [];
    private _textureMap: Map<string, Texture> = new Map();

    /**
     * Called by FetchMagicWordsCommand to store the metadata from JSON
     */
    public setAvatarData(avatars: { name: string, position: string }[]): void {
        avatars.forEach(avatar => {
            this._positions.set(avatar.name, avatar.position as AvatarPosition);
        });
    }

    /**
     * Returns the avatar position associated with the given character name.
     * If no position is found in the metadata, the default position is returned.
     * 
     * @param characterName The name of the character to look up the position for.
     * 
     * @returns The avatar position associated with the character name, or the default position if not found.
     */
    public getPosition(characterName: string): AvatarPosition {
        return this._positions.get(characterName) || GameConfig.WORDS.DEFAULT_AVATAR_POSITION;
    }

    /**
     * Sets the MagicWords data from the parsed JSON response.
     * 
     * @param data The array of MagicWordVOs to store in the model.
     */
    public setData(data: MagicWordVO[]): void {
        this._words = data;
    }

    /**
     * Returns the array of MagicWordVOs that represent the MagicWords data.
     * Each MagicWordVO contains the character name and the raw text associated with it.
     * This data is set by FetchMagicWordsCommand after parsing the JSON response.
     * 
     * @returns The array of MagicWordVOs representing the MagicWords data.
     */
    public get words(): MagicWordVO[] {
        return this._words;
    }

    /**
     * Sets the map of textures for the MagicWords feature.
     * This map is used to resolve the textures for the RichTextRow components.
     * The map is populated by FetchMagicWordsCommand after loading the necessary assets.
     * 
     * @param map The map of textures to set in the model.
     */
    public setTextures(map: Map<string, Texture>): void {
        this._textureMap = map;
    }

    /**
     * Returns the texture associated with the given id.
     * If no texture is found in the map, the default texture is returned.
     * 
     * @param id The id of the texture to look up.
     * 
     * @returns The texture associated with the given id, or the default texture if not found.
     */
    public getTexture(id: string): Texture {
        return this._textureMap.get(id) || this._textureMap.get("default")!;
    }
}