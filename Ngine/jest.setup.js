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

// Ensure any pending Animated timers are flushed inside act() so React test updates are wrapped
const { act } = require('react-test-renderer');
if (typeof global.afterEach === 'function') {
  global.afterEach(async () => {
    // Allow microtask queue and pending timeouts to run inside act so updates are wrapped properly
    try {
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });
    } catch (e) {
      // if act throws, fall back to a small delay
      await new Promise((r) => setTimeout(r, 0));
    }
  });
} else if (typeof afterEach === 'function') {
  // fallback if the global namespace provides afterEach directly
  afterEach(async () => {
    try {
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });
    } catch (e) {
      await new Promise((r) => setTimeout(r, 0));
    }
  });
} else {
  // No test lifecycle hooks available in this environment; skip setup
}
