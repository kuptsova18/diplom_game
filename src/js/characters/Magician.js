const Character = require('./Character');

class Magician extends Character {
  constructor(level) {
    super(level, 'magician');
    this.attack = 10;
    this.defence = 40;
  }
}
module.exports = Magician;