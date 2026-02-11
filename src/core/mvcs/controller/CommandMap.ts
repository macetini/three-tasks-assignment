// src/core/mvcs/controller/CommandMap.ts
import type { SignalBus } from "../../signal/SignalBus";
import type { ModelMap } from "../model/ModelMap";
import type { AssetService } from "../service/AssetService";
import { AbstractCommand } from "./AbstractCommand";
import type { ICommand } from "./meta/ICommand";

type CommandConstructor = new (payload?: any) => ICommand;

export class CommandMap {
    private readonly commands = new Map<string, CommandConstructor>();

    private readonly signalBus: SignalBus;
    private readonly assetService: AssetService;
    private readonly modelMap: ModelMap;

    constructor(signalBus: SignalBus, assetService: AssetService, modelMap: ModelMap) {
        this.signalBus = signalBus;
        this.assetService = assetService;
        this.modelMap = modelMap;
    }

    public map(signalType: string, commandClass: CommandConstructor): void {
        this.commands.set(signalType, commandClass);
        this.signalBus.on(signalType, (payload?: any) => this.execute(signalType, payload));
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