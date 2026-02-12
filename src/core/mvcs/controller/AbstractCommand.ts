// src/core/mvcs/command/AbstractCommand.ts
import type { SignalBus } from "../../signal/SignalBus";
import type { ModelMap } from "../model/ModelMap";
import type { AssetService } from "../service/AssetService";
import type { ICommand } from "./meta/ICommand";

/**
 * Abstract class representing a command.
 */
export abstract class AbstractCommand<T = unknown> implements ICommand {
    protected signalBus!: SignalBus;
    protected assetService!: AssetService;
    protected modelMap!: ModelMap;

    protected readonly payload: T;

    /**
     * Creates a new instance of the AbstractCommand class.
     * @param payload - The payload that will be passed to the execute method.
     */
    constructor(payload: T) {
        this.payload = payload;
    }

    /**
     * Sets the dependencies required for the command execution.
     * @param deps - Object containing the dependencies: signalBus, assetService, and modelMap.
     */
    public setDependencies(deps: { signalBus: SignalBus, assetService: AssetService, modelMap: ModelMap }): void {
        this.signalBus = deps.signalBus;
        this.assetService = deps.assetService;
        this.modelMap = deps.modelMap;
    }

    public abstract execute(): void | Promise<void>;
}