// Jest setup: mock modules that require native runtime
// Mock AsyncStorage using the official mock helper
try {
  const mockAsyncStorage = require('@react-native-async-storage/async-storage/jest/async-storage-mock');
  jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
} catch (e) {
  // If the package isn't present, leave it — tests will surface module-not-found errors
}

// Optional: silence certain console warnings in tests
const { console } = global;
const origWarn = console.warn;
console.warn = (...args) => {
  const first = args[0] || '';
  if (typeof first === 'string' && (first.includes('Setting a timer') || first.includes('Missing Supabase environment variables'))) return;
  origWarn(...args);
};
