// src/core/mvcs/controller/CommandMap.ts
import type { SignalBus } from "../../signal/SignalBus";
import type { ModelMap } from "../model/ModelMap";
import type { AssetService } from "../service/AssetService";
import { AbstractCommand } from "./AbstractCommand";

/**
 * Type definition for a Command constructor.
 */
type CommandConstructor<T> = new (payload: T) => AbstractCommand<T>;

/**
 * Handles the mapping and execution of Commands triggered by signals.
 * This class acts as a central hub for business logic execution, providing
 * dependency injection to all commands.
 */
export class CommandMap {
    private readonly commands = new Map<string, CommandConstructor<unknown>>();

    private readonly signalBus: SignalBus;
    private readonly assetService: AssetService;
    private readonly modelMap: ModelMap;

    /**
     * Constructor for the CommandMap class.
     * @param signalBus - The SignalBus instance, used for event dispatching.
     * @param assetService - The AssetService instance, used for loading assets.
     * @param modelMap - The ModelMap instance, used for accessing Models.
     */
    constructor(signalBus: SignalBus, assetService: AssetService, modelMap: ModelMap) {
        this.signalBus = signalBus;
        this.assetService = assetService;
        this.modelMap = modelMap;
    }

    /**
     * Maps a signal type to a command class. When a signal of type <code>signalType</code>
     *  is emitted, an instance of <code>commandClass</code> is created and executed.
     * @param signalType - The type of signal which should trigger the command execution.
     * @param commandClass - The class of the command which should be executed when the signal is emitted.
     */
    public map<T>(signalType: string, commandClass: CommandConstructor<T>): void {
        this.commands.set(signalType, commandClass as CommandConstructor<unknown>);
        this.signalBus.on<T>(signalType, (payload) => this.execute(signalType, payload));
    }
    /**
     * Executes a command based on the given signal type and payload.
     * @remarks
     * The command class is retrieved from the internal map using the signal type.
     * If the command class is found, an instance of the command is created with the given payload.
     * The command's dependencies are set to the internally stored signal bus, asset service, and model map.
     * Finally, the command is executed.
     * If the command class is not found, or if the command is not an instance of AbstractCommand, a TypeError is thrown.
     */
    private execute(signalType: string, payload?: unknown): void {
        const CommandClass = this.commands.get(signalType);

        if (CommandClass) {
            const command = new CommandClass(payload);
            if (command instanceof AbstractCommand) {
                command.setDependencies({
                    signalBus: this.signalBus,
                    assetService: this.assetService,
                    modelMap: this.modelMap
                });
            } else {
                throw new TypeError("[CommandMap] Command must be an instance of AbstractCommand.");
            }

            command.execute();
        }
    }
}