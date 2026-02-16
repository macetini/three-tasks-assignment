// src/core/mvcs/command/FetchMagicWordsCommand.ts
import { Cache, type Texture } from "pixi.js";
import { GameConfig } from "../../../config/GameConfig";
import { ModelSignals } from "../../../signal/ModelSignals";
import type { MagicWordsResponse } from "../../model/states/dto/MagicWordsResponse";
import { MagicWordsModel } from "../../model/states/MagicWordsModel";
import { MagicWordVO } from "../../model/states/vo/MagicWordVO";
import { AbstractCommand } from "../AbstractCommand";

/**
 * Command responsible for the complete setup of the Magic Words feature.
 * * This orchestrates a complex initialization sequence:
 * 1. Loads fail-safe fallback assets.
 * 2. Fetches dynamic dialogue data from the Softgames API.
 * 3. Concurrently loads all associated remote textures (emojis and avatars).
 * 4. Hydrates the MagicWordsModel with structured Value Objects (VOs).
 * 
 * * @extends AbstractCommand<void>
 */
export class FetchMagicWordsCommand extends AbstractCommand {
    private readonly cfg = GameConfig.WORDS;

    /**
     * Executes the MagicWords feature setup.
     * This command is a critical path for the MagicWords feature and should not be skipped.
     * It will load the necessary assets (emoji and avatars) via the AssetService, and then
     * fetch the MagicWords API data and populate the MagicWordsModel with the data.
     * Once the setup is complete, it will notify the application that the feature is ready for use.
     * 
     * @returns A promise that resolves when the setup is complete.
     */
    public async execute(): Promise<void> {
        try {
            await this.loadFailSafeAssets();
            await this.loadFeatureContent();

            this.signalBus.emit(ModelSignals.MAGIC_WORDS_LOADED);

            console.debug("[FetchMagicWordsCommand] Magic Words Task Ready.");
        } catch (error) {
            console.error("[FetchMagicWordsCommand] Setup failed:", error);
        }
    }

    /**
     * Loads the fail-safe assets required for the MagicWords feature.
     * This currently only includes the Dicebear emoji asset.
     * @returns A promise that resolves when all assets are loaded.
     */
    private async loadFailSafeAssets(): Promise<void> {
        await this.assetService.loadRemoteTexture("default", this.cfg.DICEBEAR_URL);
    }

    /**
     * Fetches the MagicWords API and populates the MagicWordsModel with the data.
     * It also loads the necessary assets (emoji and avatars) via the AssetService.
     * This command is a critical path for the MagicWords feature and should not be skipped.
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

    /**
     * Maps all asset keys (default, emojis, avatars) to their cached Textures.
     * If an asset key is not found in the Cache, it is skipped.
     * 
     * @param json The JSON response containing the Magic Words data.
     * 
     * @returns A Map containing all asset keys mapped to their Textures.
     */
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