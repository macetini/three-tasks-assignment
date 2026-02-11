// src/core/mvcs/command/AbstractCommand.ts
import type { SignalBus } from "../../signal/SignalBus";
import type { ModelMap } from "../model/ModelMap";
import type { AssetService } from "../service/AssetService";
import type { ICommand } from "./meta/ICommand";

export abstract class AbstractCommand<T = unknown> implements ICommand {
    protected signalBus!: SignalBus;
    protected assetService!: AssetService;
    protected modelMap!: ModelMap;

    protected readonly payload: T;

    constructor(payload: T) {
        this.payload = payload;
    }

    public setDependencies(deps: { signalBus: SignalBus, assetService: AssetService, modelMap: ModelMap }): void {
        this.signalBus = deps.signalBus;
        this.assetService = deps.assetService;
        this.modelMap = deps.modelMap;
    }

    public abstract execute(): void | Promise<void>;
}