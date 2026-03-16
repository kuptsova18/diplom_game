import Character from '../Character';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';
import Vampire from '../characters/Vampire';
import Undead from '../characters/Undead';
import Daemon from '../characters/Daemon';

test('should throw error when creating Character directly', () => {
  expect(() => new Character(1)).toThrow('Cannot create Character directly');
});

test('should not throw error when creating inherited class', () => {
  expect(() => new Bowman(1)).not.toThrow();
});

describe('Character stats for level 1', () => {
  test('Bowman should have correct stats', () => {
    const bowman = new Bowman(1);
    expect(bowman.attack).toBe(25);
    expect(bowman.defence).toBe(25);
    expect(bowman.type).toBe('bowman');
  });

  test('Swordsman should have correct stats', () => {
    const swordsman = new Swordsman(1);
    expect(swordsman.attack).toBe(40);
    expect(swordsman.defence).toBe(10);
    expect(swordsman.type).toBe('swordsman');
  });

  test('Magician should have correct stats', () => {
    const magician = new Magician(1);
    expect(magician.attack).toBe(10);
    expect(magician.defence).toBe(40);
    expect(magician.type).toBe('magician');
  });

  test('Vampire should have correct stats', () => {
    const vampire = new Vampire(1);
    expect(vampire.attack).toBe(25);
    expect(vampire.defence).toBe(25);
    expect(vampire.type).toBe('vampire');
  });

  test('Undead should have correct stats', () => {
    const undead = new Undead(1);
    expect(undead.attack).toBe(40);
    expect(undead.defence).toBe(10);
    expect(undead.type).toBe('undead');
  });

  test('Daemon should have correct stats', () => {
    const daemon = new Daemon(1);
    expect(daemon.attack).toBe(10);
    expect(daemon.defence).toBe(40);
    expect(daemon.type).toBe('daemon');
  });
});
