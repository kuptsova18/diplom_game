const Character = require('./Character');

class Daemon extends Character {
  constructor(level) {
    super(level, 'daemon');
    this.attack = 10;
    this.defence = 10;
  }
}

module.exports = Daemon;