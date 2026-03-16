const Character = require('./Character');

class Bowman extends Character {
  constructor(level) {
    super(level, 'bowman');
    this.attack = 25;
    this.defence = 25;
  }
}

module.exports = Bowman;
