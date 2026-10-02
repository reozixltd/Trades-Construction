/**
 * Minimal conversion counters (tap-to-call clicks, quote submissions) shown
 * in the console. Demo: stored in the browser. Production: forward to the
 * client's analytics (GA4 / Plausible) from `track` instead.
 */
import { getStorage, readJson, writeJson } from './storage';

export type TrackedEvent = 'call_click' | 'quote_submit' | 'area_check';

export const COUNTERS_KEY = 'ft.counters';

export function track(event: TrackedEvent): void {
  const storage = getStorage();
  const counters = readJson<Partial<Record<TrackedEvent, number>>>(storage, COUNTERS_KEY, {});
  counters[event] = (counters[event] ?? 0) + 1;
  writeJson(storage, COUNTERS_KEY, counters);
}

export function readCounters(): Record<TrackedEvent, number> {
  const c = readJson<Partial<Record<TrackedEvent, number>>>(getStorage(), COUNTERS_KEY, {});
  return { call_click: c.call_click ?? 0, quote_submit: c.quote_submit ?? 0, area_check: c.area_check ?? 0 };
}
