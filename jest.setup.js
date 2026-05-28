import '@testing-library/jest-native/extend-expect';

// Mock de Expo Constants
jest.mock('expo-constants', () => ({
  expoConfig: { hostUri: '127.0.0.1:19000' },
  manifest: { debuggerHost: '127.0.0.1:19000' },
  manifest2: { extra: { expoClient: { hostUri: '127.0.0.1:19000' } } },
}));

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock de navegação
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Suprimir avisos de console durante testes
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
