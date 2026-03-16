const Team = require('./Team');
const PositionedCharacter = require('./PositionedCharacter');

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const randomIndex = Math.floor(Math.random() * allowedTypes.length);
    const CharacterClass = allowedTypes[randomIndex];
    const level = Math.floor(Math.random() * maxLevel) + 1;

    const character = new CharacterClass(level);

    yield character;
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
function generateTeam(allowedTypes, maxLevel, characterCount) {

  const generator = characterGenerator(allowedTypes, maxLevel);
  const characters = [];
  for (let i = 0; i < characterCount; i++) {
    const character = generator.next().value;

    characters.push(character);
  }

  return new Team(characters);
}
module.exports = {
  characterGenerator,
  generateTeam
};