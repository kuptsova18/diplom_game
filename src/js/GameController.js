const GamePlay = require('./GamePlay');
const themes = require('./themes');
const Bowman = require('./characters/Bowman');
const Swordsman = require('./characters/Swordsman');
const Magician = require('./characters/Magician');
const Undead = require('./characters/Undead');
const Daemon = require('./characters/Daemon');
const Vampire = require('./characters/Vampire');
const { generateTeam } = require('./generators');
const PositionedCharacter = require('./PositionedCharacter');
const cursors = require('./cursors');

const {
  generateTooltipMessage,
  getAttackRange,
  getMoveRange,
  canAttack,
  canMove
} = require('./utils');

const levelThemes = {
  1: themes.prairie,
  2: themes.desert,
  3: themes.arctic,
  4: themes.mountain,
};

const playerTypes = [Bowman, Swordsman, Magician];
const enemyTypes = [Vampire, Undead, Daemon];

class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = 8;
    this.playerPositions = [0, 1, 8, 9, 16, 17, 24, 25];
    this.enemyPositions = [6, 7, 14, 15, 22, 23, 30, 31];
    this.selectedCharacter = null;
    this.currentPlayer = 'player';
    this.currentLevel = 1;
    this.score = 0;
    this.maxScore = 0;
    this.positionedCharacters = [];
  }

  init() {
    try {
      const savedState = this.stateService.load();
      if (savedState) {
        this.loadGame(savedState);
        return;
      }
    } catch (e) {
      this.gamePlay.showError('Не удалось загрузить сохранение');
    }
    this.startNewGame();
  }

  startNewGame() {
    this.currentLevel = 1;
    this.score = 0;
    this.currentPlayer = 'player';
    this.selectedCharacter = null;

    this.gamePlay.drawUi(levelThemes[this.currentLevel]);
    this.initLevel();
    this.initEventListeners();

    this.saveGame();
  }

  initLevel() {
    const playerTeam = generateTeam(playerTypes, this.currentLevel, 4);
    const enemyTeam = generateTeam(enemyTypes, this.currentLevel, 4);

    const selectedPlayerPositions = this.getUniquePositions(this.playerPositions, playerTeam.characters.length);
    const selectedEnemyPositions = this.getUniquePositions(this.enemyPositions, enemyTeam.characters.length);

    const positionedCharacters = [];

    playerTeam.characters.forEach((character, index) => {
      positionedCharacters.push(new PositionedCharacter(character, selectedPlayerPositions[index]));
    });

    enemyTeam.characters.forEach((character, index) => {
      positionedCharacters.push(new PositionedCharacter(character, selectedEnemyPositions[index]));
    });

    this.gamePlay.redrawPositions(positionedCharacters);
    this.positionedCharacters = positionedCharacters;
  }

  getUniquePositions(availablePositions, count) {
    const shuffled = [...availablePositions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  initEventListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  onCellEnter(index) {
    const character = this.positionedCharacters.find((char) => char.position === index);
    if (character) {
      this.gamePlay.showCellTooltip(generateTooltipMessage(character.character), index);
    }
    this.updateCursor(index);
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  async onCellClick(index) {
    const character = this.positionedCharacters.find((char) => char.position === index);
    if (this.currentLevel > 4 || this.isGameOver()) {
      this.gamePlay.showError('Игра окончена');
      return;
    }

    if (this.currentPlayer === 'computer') {
      this.gamePlay.showError('Сейчас ход компьютера');
      return;
    }

    if (this.selectedCharacter) {
      const target = this.positionedCharacters.find((char) => char.position === index);
      if (target && this.isEnemy(target.character.type)) {
        await this.performAttack(this.selectedCharacter, target, index);
      } else if (!target && this.isValidMove(this.selectedCharacter.position, index)) {
        await this.performMove(this.selectedCharacter, index);
      } else {
        this.gamePlay.showError('Невозможное действие');
      }
    } else if (character && this.isPlayerCharacter(character.character.type)) {
      if (this.currentPlayer === 'player') {
        this.selectCharacter(character);
      }
    } else {
      this.gamePlay.showError(character ? 'Это не ваш персонаж' : 'Выберите своего персонажа');
    }
  }

  onNewGameClick() {
    this.startNewGame();
  }

  onSaveGameClick() {
    this.saveGame();
    this.gamePlay.showMessage('Игра сохранена');
  }

  onLoadGameClick() {
    try {
      const savedState = this.stateService.load();
      if (savedState) {
        this.loadGame(savedState);
        this.gamePlay.showMessage('Игра загружена');
      } else {
        this.gamePlay.showError('Нет сохраненной игры');
      }
    } catch (e) {
      this.gamePlay.showError('Ошибка загрузки');
    }
  }

  selectCharacter(character) {
    if (this.selectedCharacter) {
      this.gamePlay.deselectCell(this.selectedCharacter.position);
    }
    this.selectedCharacter = character;
    this.gamePlay.selectCell(character.position);
  }

  clearSelection() {
    if (this.selectedCharacter) {
      this.gamePlay.deselectCell(this.selectedCharacter.position);
      this.selectedCharacter = null;
    }
  }

  async performAttack(attacker, target, targetPos) {
    const attackRange = getAttackRange(attacker.character.type);
    if (!canAttack(attacker.position, targetPos, attackRange, this.boardSize)) {
      this.gamePlay.showError('Слишком далеко для атаки');
      return;
    }

    const damage = Math.max(
      attacker.character.attack - target.character.defence,
      attacker.character.attack * 0.1,
    );

    target.character.health -= damage;

    await this.gamePlay.showDamage(targetPos, damage);

    if (target.character.health <= 0) {
      this.positionedCharacters = this.positionedCharacters.filter((char) => char.position !== targetPos);
      this.score += 10;
    }

    this.gamePlay.redrawPositions(this.positionedCharacters);

    this.clearSelection();

    if (this.checkLevelComplete()) {
      this.levelUp();
    } else {
      this.endTurn();
    }
  }

  async performMove(character, newPos) {
    character.position = newPos;
    this.gamePlay.redrawPositions(this.positionedCharacters);
    this.clearSelection();
    this.endTurn();
  }

  endTurn() {
    if (this.currentPlayer === 'player') {
      this.currentPlayer = 'computer';
      setTimeout(() => this.computerTurn(), 500);
    } else {
      this.currentPlayer = 'player';
    }
    this.saveGame();
  }

  computerTurn() {
    const enemies = this.positionedCharacters.filter((char) => this.isEnemy(char.character.type));
    if (enemies.length === 0) {
      this.levelUp();
      return;
    }
    const playerChars = this.positionedCharacters.filter((char) => this.isPlayerCharacter(char.character.type));
    if (playerChars.length === 0) {
      this.gameOver();
      return;
    }

    const enemy = enemies[Math.floor(Math.random() * enemies.length)];

    let closestPlayer = null;
    let minDistance = Infinity;

    playerChars.forEach((player) => {
      const distance = Math.max(
        Math.abs((enemy.position % this.boardSize) - (player.position % this.boardSize)),
        Math.abs(Math.floor(enemy.position / this.boardSize) - Math.floor(player.position / this.boardSize)),
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestPlayer = player;
      }
    });

    if (closestPlayer && this.canEnemyAttack(enemy, closestPlayer)) {
      this.performAttack(enemy, closestPlayer, closestPlayer.position);
    } else {
      this.computerMove(enemy, playerChars);
    }
  }

  computerMove(enemy, playerChars) {
    const moveRange = getMoveRange(enemy.character.type);
    const possibleMoves = this.getPossibleMoves(enemy.position, moveRange);

    const freeMoves = possibleMoves.filter((pos) => !this.positionedCharacters.some((char) => char.position === pos));

    if (freeMoves.length > 0) {
      const newPos = freeMoves[Math.floor(Math.random() * freeMoves.length)];
      enemy.position = newPos;
      this.gamePlay.redrawPositions(this.positionedCharacters);
    }
    setTimeout(() => this.endTurn(), 500);
  }

  getPossibleMoves(position, range) {
    const moves = [];
    const x = position % this.boardSize;
    const y = Math.floor(position / this.boardSize);

    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        if (dx === 0 && dy === 0) continue;

        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newX < this.boardSize && newY >= 0 && newY < this.boardSize) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) <= range) {
            moves.push(newY * this.boardSize + newX);
          }
        }
      }
    }
    return moves;
  }

  canEnemyAttack(enemy, player) {
    const attackRange = getAttackRange(enemy.character.type);
    return canAttack(enemy.position, player.position, attackRange, this.boardSize);
  }

  isValidMove(fromPos, toPos) {
    if (!this.selectedCharacter) return false;

    const moveRange = getMoveRange(this.selectedCharacter.character.type);
    const targetOccupied = this.positionedCharacters.some((char) => char.position === toPos);

    return !targetOccupied && canMove(fromPos, toPos, moveRange, this.boardSize);
  }

  updateCursor(index) {
    if (this.currentPlayer !== 'player' || this.currentLevel > 4 || this.isGameOver()) {
      this.gamePlay.setCursor(cursors.notallowed);
      return;
    }

    const character = this.positionedCharacters.find((char) => char.position === index);

    if (!character) {
      if (this.selectedCharacter && this.isValidMove(this.selectedCharacter.position, index)) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    } else if (this.isPlayerCharacter(character.character.type)) {
      this.gamePlay.setCursor(cursors.pointer);
    } else if (this.isEnemy(character.character.type)) {
      if (this.selectedCharacter) {
        const attackRange = getAttackRange(this.selectedCharacter.character.type);
        if (canAttack(this.selectedCharacter.position, index, attackRange, this.boardSize)) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  isPlayerCharacter(type) {
    return ['bowman', 'swordsman', 'magician'].includes(type);
  }

  isEnemy(type) {
    return ['vampire', 'undead', 'daemon'].includes(type);
  }

  checkLevelComplete() {
    const enemies = this.positionedCharacters.filter(
      (char) => this.isEnemy(char.character.type),
    );
    return enemies.length === 0;
  }

  levelUp() {
    this.currentLevel++;

    if (this.currentLevel > 4) {
      this.gameWin();
      return;
    }

    const playerChars = this.positionedCharacters.filter(
      (char) => this.isPlayerCharacter(char.character.type),
    );

    playerChars.forEach((char) => {
      char.character.health = Math.min(char.character.health + 80, 100);
      const healthBonus = (80 + char.character.health) / 100;
      char.character.attack = Math.max(
        char.character.attack,
        char.character.attack * healthBonus,
      );
      char.character.defence = Math.max(
        char.character.defence,
        char.character.defence * healthBonus,
      );
      char.character.level++;
    });

    this.gamePlay.drawUi(levelThemes[this.currentLevel]);

    const enemyTeam = generateTeam(enemyTypes, this.currentLevel, 4);
    const newEnemyPositions = this.getUniquePositions(this.enemyPositions, 4);

    this.positionedCharacters = this.positionedCharacters.filter(
      (char) => this.isPlayerCharacter(char.character.type),
    );

    enemyTeam.characters.forEach((character, index) => {
      this.positionedCharacters.push(
        new PositionedCharacter(character, newEnemyPositions[index]),
      );
    });

    this.gamePlay.redrawPositions(this.positionedCharacters);
    this.currentPlayer = 'player';
    this.selectedCharacter = null;
    this.saveGame();
  }

  gameWin() {
    this.gamePlay.showError('Победа! Вы прошли все уровни!');
    this.maxScore = Math.max(this.maxScore, this.score);
    this.currentPlayer = 'gameover';
    this.clearSelection();
  }

  gameOver() {
    this.gamePlay.showError('Game Over! Вы проиграли!');
    this.maxScore = Math.max(this.maxScore, this.score);
    this.currentPlayer = 'gameover';
    this.clearSelection();
  }

  isGameOver() {
    const playerChars = this.positionedCharacters.filter(
      (char) => this.isPlayerCharacter(char.character.type),
    );
    return playerChars.length === 0;
  }

  saveGame() {
    const state = {
      level: this.currentLevel,
      score: this.score,
      maxScore: this.maxScore,
      currentPlayer: this.currentPlayer,
      positionedCharacters: this.positionedCharacters.map((char) => ({
        character: {
          type: char.character.type,
          level: char.character.level,
          attack: char.character.attack,
          defence: char.character.defence,
          health: char.character.health,
        },
        position: char.position,
      })),
      theme: levelThemes[this.currentLevel],
    };

    this.stateService.save(state);
  }

  loadGame(savedState) {
    this.currentLevel = savedState.level;
    this.score = savedState.score;
    this.maxScore = savedState.maxScore || 0;
    this.currentPlayer = savedState.currentPlayer;
    this.selectedCharacter = null;

    this.gamePlay.drawUi(savedState.theme);

    this.positionedCharacters = savedState.positionedCharacters.map((data) => {
      let CharacterClass;
      switch (data.character.type) {
        case 'bowman':
          CharacterClass = Bowman;
          break;
        case 'swordsman':
          CharacterClass = Swordsman;
          break;
        case 'magician':
          CharacterClass = Magician;
          break;
        case 'vampire':
          CharacterClass = Vampire;
          break;
        case 'undead':
          CharacterClass = Undead;
          break;
        case 'daemon':
          CharacterClass = Daemon;
          break;
        default:
          throw new Error(`Unknown character type: ${data.character.type}`);
      }

      const character = new CharacterClass(data.character.level);
      character.attack = data.character.attack;
      character.defence = data.character.defence;
      character.health = data.character.health;

      return new PositionedCharacter(character, data.position);
    });

    this.gamePlay.redrawPositions(this.positionedCharacters);
    this.initEventListeners();
  }
}

module.exports = GameController;