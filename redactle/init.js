import { RedactleGame } from './game/redactleGame.js';

// instantiate once all prototype methods are loaded
const game = new RedactleGame();
game.loadSave();
// expose for debugging if desired
window.redactleGame = game;