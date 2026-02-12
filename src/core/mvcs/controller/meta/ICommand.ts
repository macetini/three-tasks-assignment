// src/core/mvcs/command/meta/ICommand.ts

/**
 * Defines the contract for all executable units of business logic.
 * Commands are short-lived objects created by the CommandMap to perform 
 * a specific task (e.g., updating a model or preparing assets). 
 * Implementing this interface ensures a consistent execution flow 
 * across the application.
 */
export interface ICommand {
    /**
     * The entry point for the command's logic.
     * Can return a Promise to support asynchronous operations 
     * like asset loading or server requests.
     */
    execute(): void | Promise<void>;
}