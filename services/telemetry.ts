// Telemetry adapter: keeps in-memory buffer for tests and optionally forwards events to
// Amplitude or Segment when env keys are provided.

type EventProps = Record<string, unknown> | undefined;

const events: Array<{ name: string; props?: EventProps; ts: string }> = [];

async function sendToAmplitude(apiKey: string, name: string, props?: EventProps) {
  try {
    const payload = {
      api_key: apiKey,
      events: [
        {
          event_type: name,
          event_properties: props || {},
          time: Date.now(),
        },
      ],
    };
    await fetch('https://api2.amplitude.com/2/httpapi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // swallow errors in telemetry
  }
}

async function sendToSegment(writeKey: string, name: string, props?: EventProps) {
  try {
    const payload = {
      event: name,
      userId: (props && (props as any).userId) || 'anonymous',
      properties: props || {},
    };
    const basic = Buffer.from(`${writeKey}:`).toString('base64');
    await fetch('https://api.segment.io/v1/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${basic}` },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // swallow errors in telemetry
  }
}

export function trackEvent(name: string, props?: EventProps) {
  try {
    // Keep a local record for tests and basic debugging
    events.push({ name, props, ts: new Date().toISOString() });
    // Log to console for visibility
    // eslint-disable-next-line no-console
    console.log('[telemetry] event', name, props || '');

    // Fire-and-forget forward to provider if configured
    const ampKey = process.env.AMPLITUDE_API_KEY || (process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY);
    const segKey = process.env.SEGMENT_WRITE_KEY || (process.env.EXPO_PUBLIC_SEGMENT_WRITE_KEY);

    if (ampKey) {
      // intentionally not awaited
      void sendToAmplitude(String(ampKey), name, props);
    } else if (segKey) {
      void sendToSegment(String(segKey), name, props);
    }
  } catch (e) {
    // no-op
  }
}

export function getEvents() {
  return events.slice();
}

export function resetEvents() {
  events.length = 0;
}
