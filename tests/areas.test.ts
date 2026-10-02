import { describe, expect, it } from 'vitest';
import { areaHint, checkArea, isOutOfArea, normaliseQuery } from '@/lib/areas';

const areas = {
  covered: [
    { suburb: 'Castle Hill', postcode: '2154', page: 'castle-hill' },
    { suburb: 'Kellyville', postcode: '2155' },
    { suburb: 'Rouse Hill', postcode: '2155' },
  ],
  nearby: [{ suburb: 'Hornsby', postcode: '2077' }],
};

describe('normaliseQuery', () => {
  it('lowercases, trims and collapses spaces', () => {
    expect(normaliseQuery('  CASTLE   hill ')).toBe('castle hill');
  });
  it('strips a trailing state and postcode', () => {
    expect(normaliseQuery('Castle Hill NSW 2154')).toBe('castle hill');
  });
});

describe('checkArea', () => {
  it('matches a covered suburb case-insensitively', () => {
    const r = checkArea('castle hill', areas);
    expect(r.status).toBe('covered');
    expect(r.matches[0]?.page).toBe('castle-hill');
  });

  it('matches by postcode and returns every suburb sharing it', () => {
    const r = checkArea('2155', areas);
    expect(r.status).toBe('covered');
    expect(r.matches.map((m) => m.suburb)).toEqual(['Kellyville', 'Rouse Hill']);
  });

  it('matches a suburb written with state and postcode', () => {
    expect(checkArea('Kellyville NSW 2155', areas).status).toBe('covered');
  });

  it('returns nearby for the ask-us list', () => {
    expect(checkArea('Hornsby', areas).status).toBe('nearby');
  });

  it('returns not-covered for an unknown suburb', () => {
    expect(checkArea('Wollongong', areas).status).toBe('not-covered');
  });

  it('returns invalid for empty or too-short input', () => {
    expect(checkArea('', areas).status).toBe('invalid');
    expect(checkArea('a', areas).status).toBe('invalid');
  });

  it('returns invalid for a malformed postcode', () => {
    expect(checkArea('215', areas).status).toBe('invalid');
  });

  it('lets a typed suburb name win over a conflicting postcode', () => {
    expect(checkArea('Hornsby 2154', areas).status).toBe('nearby');
    expect(checkArea('Wollongong 2155', areas).status).toBe('not-covered');
  });
});

describe('isOutOfArea / areaHint', () => {
  it('flags nearby and not-covered only', () => {
    expect(isOutOfArea('covered')).toBe(false);
    expect(isOutOfArea('nearby')).toBe(true);
    expect(isOutOfArea('not-covered')).toBe(true);
  });
  it('gives a hint for each known status', () => {
    expect(areaHint('covered')).toMatch(/service area/);
    expect(areaHint('invalid')).toBe('');
  });
});
