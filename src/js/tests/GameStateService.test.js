import GameStateService from '../GameStateService';

jest.mock('../GameStateService');

beforeEach(() => {
  jest.resetAllMocks();
});

test('should load state successfully', () => {
  const mockStorage = {
    getItem: jest.fn(() => '{"level":1}'),
  };
  const service = new GameStateService(mockStorage);
  const state = service.load();
  expect(state).toEqual({ level: 1 });
});

test('should throw error on invalid state', () => {
  const mockStorage = {
    getItem: jest.fn(() => 'invalid json'),
  };
  const service = new GameStateService(mockStorage);
  expect(() => service.load()).toThrow('Invalid state');
});
