const GamePlay = require('./GamePlay');
const GameController = require('./GameController');
const GameStateService = require('./GameStateService');

const gamePlay = new GamePlay();
gamePlay.bindToDOM(document.querySelector('#game-container'));

const stateService = new GameStateService(localStorage);

const gameCtrl = new GameController(gamePlay, stateService);
gameCtrl.init();
