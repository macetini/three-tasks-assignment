// src/core/mvcs/command/FetchMagicWordsCommand.ts
import { Cache, type Texture } from "pixi.js";
import { GameConfig } from "../../../config/GameConfig";
import { ModelType } from "../../../signal/type/ModelType";
import type { MagicWordsResponse } from "../../model/states/dto/MagicWordsResponse";
import { MagicWordsModel } from "../../model/states/MagicWordsModel";
import { MagicWordVO } from "../../model/states/vo/MagicWordVO";
import { AbstractCommand } from "../AbstractCommand";

export class FetchMagicWordsCommand extends AbstractCommand {
    private readonly cfg = GameConfig.WORDS;

    public async execute(): Promise<void> {
        try {
            await this.loadFailSafeAssets();
            await this.loadFeatureContent();

            this.signalBus.emit(ModelType.MAGIC_WORDS_LOADED);

            console.debug("[FetchMagicWordsCommand] Magic Words Task Ready.");
        } catch (error) {
            console.error("[FetchMagicWordsCommand] Setup failed:", error);
        }
    }

    /**
     * Ensures fallback textures are in the Cache. 
     * If these fail, the whole feature lacks a safety net.
     */
    private async loadFailSafeAssets(): Promise<void> {
        await this.assetService.loadRemoteTexture("default", this.cfg.DICEBEAR_URL);
    }

    /**
     * Fetches the dialogue JSON and loads all associated dynamic textures.
     */
    private async loadFeatureContent(): Promise<void> {
        const response = await fetch(this.cfg.SOFTGAMES_URL);
        const json = (await response.json()) as MagicWordsResponse;

        const assetPromises: Promise<any>[] = [];

        json.emojies.forEach(emoji => {
            assetPromises.push(this.assetService.loadRemoteTexture(emoji.name, emoji.url));
        });

        json.avatars.forEach(avatar => {
            assetPromises.push(this.assetService.loadRemoteTexture(avatar.name, avatar.url));
        });

        await Promise.all(assetPromises);

        // Hydrate the Model
        const model = this.modelMap.get<MagicWordsModel>(MagicWordsModel.NAME);
        const voArray = json.dialogue.map(item => new MagicWordVO(item.name, item.text));

        model.setData(voArray);
        model.setAvatarData(json.avatars);

        const textureMap = this.getTextureMap(json);
        model.setTextures(textureMap);
    }

    private getTextureMap(json: MagicWordsResponse): Map<string, Texture> {
        const textureMap = new Map<string, Texture>();

        const allAssetKeys = [
            "default",
            ...json.emojies.map(e => e.name),
            ...json.avatars.map(a => a.name)
        ];
        allAssetKeys.forEach(key => {
            if (Cache.has(key)) {
                textureMap.set(key, Cache.get(key));
            }
        });

        return textureMap;
    }
}