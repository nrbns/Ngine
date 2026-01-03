import { trackEvent, getEvents, resetEvents } from '../telemetry';

describe('telemetry provider adapter', () => {
  beforeEach(() => {
    jest.resetModules();
    resetEvents();
    delete (process.env as any).AMPLITUDE_API_KEY;
    delete (process.env as any).SEGMENT_WRITE_KEY;
    (global as any).fetch = jest.fn(() => Promise.resolve({ ok: true }));
  });

  it('buffers events locally when no provider is configured', () => {
    trackEvent('local_test', { foo: 'bar' });
    const ev = getEvents();
    expect(ev.length).toBe(1);
    expect(ev[0].name).toBe('local_test');
  });

  it('forwards to Amplitude when AMPLITUDE_API_KEY is set', async () => {
    // reload module with env var
    (process.env as any).AMPLITUDE_API_KEY = 'amp-test-key';
    // re-require to pick up env
    const telemetry = require('../telemetry');
    (global as any).fetch = jest.fn(() => Promise.resolve({ ok: true }));

    telemetry.resetEvents();

    telemetry.trackEvent('amp_event', { userId: 'u1' });

    // wait for async forward
    await new Promise((r) => setTimeout(r, 50));

    expect((global as any).fetch).toHaveBeenCalled();
    const callArgs = (global as any).fetch.mock.calls[0];
    expect(callArgs[0]).toContain('amplitude');
    const body = JSON.parse(callArgs[1].body);
    expect(body).toHaveProperty('events');
    expect(body.events[0].event_type).toBe('amp_event');
  });

  it('forwards to Segment when SEGMENT_WRITE_KEY is set', async () => {
    (process.env as any).SEGMENT_WRITE_KEY = 'seg-test-key';
    const telemetry = require('../telemetry');
    (global as any).fetch = jest.fn(() => Promise.resolve({ ok: true }));

    telemetry.resetEvents();

    telemetry.trackEvent('seg_event', { userId: 'u1' });

    await new Promise((r) => setTimeout(r, 50));

    expect((global as any).fetch).toHaveBeenCalled();
    const callArgs = (global as any).fetch.mock.calls[0];
    expect(callArgs[0]).toContain('segment');
    const body = JSON.parse(callArgs[1].body);
    expect(body.event).toBe('seg_event');
  });
});