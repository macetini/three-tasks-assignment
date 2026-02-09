import { Game } from './core/Game';

const app = new Game();
await app.init();

console.log("[Main] Game Initialized");