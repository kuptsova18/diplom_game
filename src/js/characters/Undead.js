const Character = require('./Character');

class Undead extends Character {
  constructor(level) {
    super(level, 'undead');
    this.attack = 40;
    this.defence = 10;
  }
}

module.exports = Undead;