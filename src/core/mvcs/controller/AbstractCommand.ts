// src/core/mvcs/command/AbstractCommand.ts
import type { SignalBus } from "../../signal/SignalBus";
import type { ModelMap } from "../model/ModelMap";
import type { AssetService } from "../service/AssetService";
import type { ICommand } from "./meta/ICommand";

/**
 * An abstract class representing a command in the command pattern.
 * 
 * @template T - The type of the payload that will be passed to the execute method.
 * @implements {ICommand}
 * @abstract
 * @see {@link ICommand}
 * @see {@link https://en.wikipedia.org/wiki/Command_pattern}
 * 
 */
export abstract class AbstractCommand<T = unknown> implements ICommand {
    protected signalBus!: SignalBus;
    protected assetService!: AssetService;
    protected modelMap!: ModelMap;

    /**
     * The payload that will be passed to the execute method.
     */
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

    /**
     * Executes the command behaviour defined in derived classes.
     * 
     * @throws {Error} If the command fails to execute.
     */
    public abstract execute(): void | Promise<void>;
}