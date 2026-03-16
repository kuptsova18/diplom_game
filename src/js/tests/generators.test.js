import { characterGenerator, generateTeam } from '../generators';
import Bowman from '../characters/Bowman';
import Swordsman from '../characters/Swordsman';
import Magician from '../characters/Magician';

const playerTypes = [Bowman, Swordsman, Magician];

test('characterGenerator should generate infinite characters', () => {
  const generator = characterGenerator(playerTypes, 3);
  const characters = [];

  for (let i = 0; i < 100; i++) {
    characters.push(generator.next().value);
  }

  expect(characters.length).toBe(100);
  characters.forEach((character) => {
    expect(playerTypes).toContain(character.constructor);
    expect(character.level).toBeGreaterThanOrEqual(1);
    expect(character.level).toBeLessThanOrEqual(3);
  });
});

test('generateTeam should create correct number of characters', () => {
  const team = generateTeam(playerTypes, 4, 5);
  expect(team.characters.length).toBe(5);

  team.characters.forEach((character) => {
    expect(playerTypes).toContain(character.constructor);
    expect(character.level).toBeGreaterThanOrEqual(1);
    expect(character.level).toBeLessThanOrEqual(4);
  });
});
