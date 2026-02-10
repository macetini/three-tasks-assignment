import { Game } from './core/Game';

const game = new Game();
await game.init();

console.log("[Main] Game Initialized");