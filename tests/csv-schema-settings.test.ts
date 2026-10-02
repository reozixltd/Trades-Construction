import { describe, expect, it } from 'vitest';
import { leadsToCsv } from '@/lib/leads/csv';
import { buildBusinessSchema } from '@/lib/schema';
import { SettingsStore } from '@/lib/settings';
import { createMemoryStorage } from '@/lib/storage';
import { business } from '@/config/business';
import type { Lead } from '@/lib/leads/types';

const lead: Lead = {
  id: 'L-1',
  createdAt: '2026-10-02T00:00:00.000Z',
  status: 'new',
  name: 'Sam "The Tiler" Lee',
  phone: '0491570156',
  job: 'Line one, with comma\nLine two',
  photos: [],
  outOfArea: false,
  history: [],
};

describe('leadsToCsv', () => {
  it('writes a header row and escapes quotes, commas and newlines', () => {
    const csv = leadsToCsv([lead]);
    const [header, row] = csv.split('\r\n');
    expect(header).toContain('Name');
    expect(row).toContain('"Sam ""The Tiler"" Lee"');
    expect(csv).toContain('"Line one, with comma\nLine two"');
  });

  it('neutralises spreadsheet formulas', () => {
    const csv = leadsToCsv([{ ...lead, name: '=HYPERLINK("x")' }]);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
  });
});

describe('buildBusinessSchema', () => {
  it('includes licence-holder name, phone, ABN and areas served', () => {
    const s = buildBusinessSchema(business, []);
    expect(s['@type']).toBe('HomeAndConstructionBusiness');
    expect(s.legalName).toBe(business.legalName);
    expect(s.taxID).toBe(business.abn);
    expect(s.areaServed.length).toBe(business.areas.covered.length);
  });

  it('omits aggregateRating in demo mode even with reviews', () => {
    const s = buildBusinessSchema({ ...business, demoMode: true }, [{ rating: 5 }]);
    expect(s.aggregateRating).toBeUndefined();
  });

  it('includes aggregateRating for a real business with reviews', () => {
    const s = buildBusinessSchema({ ...business, demoMode: false }, [{ rating: 5 }, { rating: 4 }]);
    expect(s.aggregateRating).toMatchObject({ ratingValue: '4.5', reviewCount: 2 });
  });
});

describe('SettingsStore', () => {
  const defaults = { emergencyEnabled: true, callbackPromise: 'Within 2 hours.' };

  it('returns defaults when nothing is saved', () => {
    expect(new SettingsStore(createMemoryStorage(), defaults).get()).toEqual(defaults);
  });

  it('merges saved overrides with defaults', () => {
    const store = new SettingsStore(createMemoryStorage(), defaults);
    store.save({ emergencyEnabled: false });
    expect(store.get()).toEqual({ emergencyEnabled: false, callbackPromise: 'Within 2 hours.' });
  });

  it('ignores an empty callback promise', () => {
    const store = new SettingsStore(createMemoryStorage(), defaults);
    store.save({ callbackPromise: '   ' });
    expect(store.get().callbackPromise).toBe('Within 2 hours.');
  });
});
