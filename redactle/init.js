import { RedactleGame } from './game/redactleGame.js';
import { ProfileData } from './game/profileData.js';
import { UI } from './game/ui.js';
import { Logic } from './game/logic.js';
import { Utility } from './game/utility.js';
import { WikiData } from './game/wikiData.js';
import { attachStartup } from './game/startup.js';

ProfileData(RedactleGame);
UI(RedactleGame);
Logic(RedactleGame);
Utility(RedactleGame);
WikiData(RedactleGame);

// instantiate once all prototype methods are loaded
const game = new RedactleGame();
window.redactleGame = game;

attachStartup(game);
game.loadSave();
