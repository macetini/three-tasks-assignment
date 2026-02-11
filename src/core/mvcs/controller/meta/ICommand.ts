// src/core/mvcs/command/meta/ICommand.ts
export interface ICommand {
    execute(): void | Promise<void>;
}