class GameState {
  constructor() {
    this.level = 1;
    this.score = 0;
    this.maxScore = 0;
    this.currentPlayer = 'player';
    this.positionedCharacters = [];
    this.theme = 'prairie';
  }

  static from(object) {
    const state = new GameState();
    Object.assign(state, object);
    return state;
  }

  save() {
    return {
      level: this.level,
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
      theme: this.theme,
    };
  }
}

module.exports = GameState;