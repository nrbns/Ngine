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

// Prevent requestAnimationFrame from scheduling real timers during tests (avoids callbacks surviving teardown)
if (typeof global.requestAnimationFrame !== 'function') {
  global.requestAnimationFrame = () => {};
} else {
  // overwrite to noop to avoid scheduling timeouts inside React Native's polyfill
  global.requestAnimationFrame = () => {};
}

// Ensure any pending Animated timers are flushed inside act() so React test updates are wrapped
const { act } = require('react-test-renderer');
if (typeof global.afterEach === 'function') {
  // Use a synchronous act to avoid scheduling timers after the Jest environment is torn down
  global.afterEach(() => {
    try {
      act(() => {});
    } catch (e) {
      // no-op
    }
  });
} else if (typeof afterEach === 'function') {
  // fallback if the global namespace provides afterEach directly
  afterEach(() => {
    try {
      act(() => {});
    } catch (e) {}
  });
} else {
  // No test lifecycle hooks available in this environment; skip setup
}
