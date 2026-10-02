/** Service-area lookup: suburb name or postcode → covered / nearby / not covered. Pure, no DOM. */

export interface AreaEntry {
  suburb: string;
  postcode: string;
  page?: string;
}

export interface AreaLists {
  covered: readonly AreaEntry[];
  nearby: readonly AreaEntry[];
}

export type AreaStatus = 'covered' | 'nearby' | 'not-covered' | 'invalid';

export interface AreaResult {
  status: AreaStatus;
  matches: AreaEntry[];
}

const STATES = /\b(nsw|vic|qld|act|sa|wa|tas|nt)\b/g;

/** "  Castle Hill NSW 2154 " → "castle hill" */
export function normaliseQuery(raw: string): string {
  return raw
    .toLowerCase()
    .replace(STATES, ' ')
    .replace(/\b\d{4}\b/g, ' ')
    .replace(/[^a-z\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPostcode(raw: string): string | null {
  return raw.match(/\b\d{4}\b/)?.[0] ?? null;
}

const byName = (list: readonly AreaEntry[], name: string) => list.filter((a) => a.suburb.toLowerCase() === name);
const byPostcode = (list: readonly AreaEntry[], postcode: string) => list.filter((a) => a.postcode === postcode);

export function checkArea(raw: string, areas: AreaLists): AreaResult {
  const trimmed = raw.trim();
  const postcode = extractPostcode(trimmed);
  const name = normaliseQuery(trimmed);
  const looksNumeric = /^\d+$/.test(trimmed);

  if ((!name && !postcode) || name.length === 1 || (looksNumeric && !postcode)) {
    return { status: 'invalid', matches: [] };
  }

  // A typed suburb name wins over a postcode ("Liverpool 2150" is Liverpool).
  if (name) {
    const covered = byName(areas.covered, name);
    if (covered.length) return { status: 'covered', matches: covered };
    const nearby = byName(areas.nearby, name);
    if (nearby.length) return { status: 'nearby', matches: nearby };
    return { status: 'not-covered', matches: [] };
  }

  const covered = byPostcode(areas.covered, postcode!);
  if (covered.length) return { status: 'covered', matches: covered };
  const nearby = byPostcode(areas.nearby, postcode!);
  if (nearby.length) return { status: 'nearby', matches: nearby };
  return { status: 'not-covered', matches: [] };
}

/** A lead is flagged for the owner when its suburb isn't in the covered list. */
export function isOutOfArea(status: AreaStatus): boolean {
  return status === 'nearby' || status === 'not-covered';
}

/** Short hint shown under the suburb field of the quote form. */
export function areaHint(status: AreaStatus): string {
  switch (status) {
    case 'covered': return '✓ In our service area.';
    case 'nearby': return 'Just outside our usual area — we’ll check.';
    case 'not-covered': return 'Outside our usual area — send it anyway.';
    default: return '';
  }
}
