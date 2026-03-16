import {
  getAttackRange, getMoveRange, canAttack, canMove,
} from '../utils';

describe('Character ranges', () => {
  test('Swordsman should have correct ranges', () => {
    expect(getAttackRange('swordsman')).toBe(1);
    expect(getMoveRange('swordsman')).toBe(4);
  });

  test('Bowman should have correct ranges', () => {
    expect(getAttackRange('bowman')).toBe(2);
    expect(getMoveRange('bowman')).toBe(2);
  });

  test('Magician should have correct ranges', () => {
    expect(getAttackRange('magician')).toBe(4);
    expect(getMoveRange('magician')).toBe(1);
  });

  test('Undead should have correct ranges', () => {
    expect(getAttackRange('undead')).toBe(1);
    expect(getMoveRange('undead')).toBe(4);
  });

  test('Vampire should have correct ranges', () => {
    expect(getAttackRange('vampire')).toBe(2);
    expect(getMoveRange('vampire')).toBe(2);
  });

  test('Daemon should have correct ranges', () => {
    expect(getAttackRange('daemon')).toBe(4);
    expect(getMoveRange('daemon')).toBe(1);
  });
});

describe('Attack calculation', () => {
  const boardSize = 8;

  test('Should detect adjacent attack', () => {
    expect(canAttack(9, 10, 1, boardSize)).toBe(true); // right
    expect(canAttack(9, 8, 1, boardSize)).toBe(true); // left
    expect(canAttack(9, 1, 1, boardSize)).toBe(true); // up
    expect(canAttack(9, 17, 1, boardSize)).toBe(true); // down
    expect(canAttack(9, 0, 1, boardSize)).toBe(true); // up-left
  });

  test('Should detect range 2 attack', () => {
    expect(canAttack(9, 11, 2, boardSize)).toBe(true); // right 2
    expect(canAttack(9, 18, 2, boardSize)).toBe(true); // down 2
    expect(canAttack(9, 0, 2, boardSize)).toBe(false); // too far
  });

  test('Should not attack same cell', () => {
    expect(canAttack(9, 9, 1, boardSize)).toBe(false);
  });
});

describe('Movement calculation', () => {
  const boardSize = 8;

  test('Should detect valid moves for swordsman', () => {
    expect(canMove(9, 13, 4, boardSize)).toBe(true); // right 4
    expect(canMove(9, 41, 4, boardSize)).toBe(true); // down 4
    expect(canMove(9, 42, 4, boardSize)).toBe(false); // too far
  });

  test('Should detect valid moves for magician', () => {
    expect(canMove(9, 10, 1, boardSize)).toBe(true); // adjacent
    expect(canMove(9, 11, 1, boardSize)).toBe(false); // too far
  });
});
