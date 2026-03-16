class Team {
  constructor(characters = []) {
    this.characters = characters;
  }

  add(character) {
    this.characters.add(character);
  }

  * [Symbol.iterator]() {
    for (const character of this.characters) {
      yield character;
    }
  }
}

module.exports = Team;