// src/core/mvcs/controller/CommandMap.ts
import type { SignalBus } from "../../signal/SignalBus";
import type { ModelMap } from "../model/ModelMap";
import type { AssetService } from "../service/AssetService";
import { AbstractCommand } from "./AbstractCommand";

type CommandConstructor<T> = new (payload: T) => AbstractCommand<T>;

export class CommandMap {
    private readonly commands = new Map<string, CommandConstructor<unknown>>();

    private readonly signalBus: SignalBus;
    private readonly assetService: AssetService;
    private readonly modelMap: ModelMap;

    constructor(signalBus: SignalBus, assetService: AssetService, modelMap: ModelMap) {
        this.signalBus = signalBus;
        this.assetService = assetService;
        this.modelMap = modelMap;
    }

    public map<T>(signalType: string, commandClass: CommandConstructor<T>): void {
        this.commands.set(signalType, commandClass as CommandConstructor<unknown>);
        this.signalBus.on<T>(signalType, (payload) => this.execute(signalType, payload));
    }
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