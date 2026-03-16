/**
 * @todo
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:

 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */

function calcTileType(index, boardSize) {
  const topRow = index < boardSize;
  const bottomRow = index >= boardSize * (boardSize - 1);
  const leftCol = index % boardSize === 0;
  const rightCol = index % boardSize === boardSize - 1;
  if (topRow) {
    if (leftCol) return 'top-left';
    if (rightCol) return 'top-right';
    return 'top';
  }
  if (bottomRow) {
    if (leftCol) return 'bottom-left';
    if (rightCol) return 'bottom-right';
    return 'bottom';
  }

  if (leftCol) return 'left';
  if (rightCol) return 'right';
  return 'center';
}


function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

function generateTooltipMessage(character) {
  return `\uD83C\uDF96${character.level} \u2694${character.attack} \uD83D\uDEE1${character.defence} \u2764${character.health}`;
}

function getAttackRange(type) {
  const ranges = {
    swordsman: 1,
    undead: 1,
    bowman: 2,
    vampire: 2,
    magician: 4,
    daemon: 4,
  };
  return ranges[type] || 1;
}

function getMoveRange(type) {
  const ranges = {
    swordsman: 4,
    undead: 4,
    bowman: 2,
    vampire: 2,
    magician: 1,
    daemon: 1,
  };
  return ranges[type] || 1;
}

function canAttack(attackerPos, targetPos, attackRange, boardSize = 8) {
  const attackerX = attackerPos % boardSize;
  const attackerY = Math.floor(attackerPos / boardSize);
  const targetX = targetPos % boardSize;  
  const targetY = Math.floor(targetPos / boardSize);

  const distance = Math.max(Math.abs(attackerX - targetX), Math.abs(attackerY - targetY));
  return distance <= attackRange && distance > 0;
}

function canMove(currentPos, targetPos, moveRange, boardSize = 8) {
  const currentX = currentPos % boardSize;
  const currentY = Math.floor(currentPos / boardSize);
  const targetX = targetPos % boardSize;
  const targetY = Math.floor(targetPos / boardSize);

  const distance = Math.max(Math.abs(currentX - targetX), Math.abs(currentY - targetY));
  return distance <= moveRange && distance > 0;
}

module.exports = {
  calcTileType,
  calcHealthLevel,
  generateTooltipMessage,
  getAttackRange,
  getMoveRange,
  canAttack,
  canMove
};