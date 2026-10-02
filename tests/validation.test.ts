import { describe, expect, it } from 'vitest';
import {
  normalisePhone,
  validateLeadInput,
  validatePhotos,
  isLikelySpam,
  PHOTO_LIMITS,
} from '@/lib/leads/validation';

const valid = { name: 'Sam Lee', phone: '0491 570 156', job: 'Leaking shower, water coming through the wall' };

describe('normalisePhone', () => {
  it('accepts AU mobiles with spaces, dashes or +61', () => {
    expect(normalisePhone('0491 570 156')).toBe('0491570156');
    expect(normalisePhone('0491-570-156')).toBe('0491570156');
    expect(normalisePhone('+61 491 570 156')).toBe('0491570156');
  });
  it('accepts landlines with area code', () => {
    expect(normalisePhone('(02) 5550 4821')).toBe('0255504821');
  });
  it('rejects too short, too long or non-AU numbers', () => {
    expect(normalisePhone('12345')).toBeNull();
    expect(normalisePhone('04915701560')).toBeNull();
    expect(normalisePhone('+1 555 123 4567')).toBeNull();
  });
});

describe('validateLeadInput', () => {
  it('passes with only the three required fields', () => {
    expect(validateLeadInput(valid)).toEqual({ ok: true, errors: {} });
  });

  it('requires a name of at least 2 characters', () => {
    expect(validateLeadInput({ ...valid, name: ' ' }).errors.name).toBeDefined();
  });

  it('requires a valid phone', () => {
    expect(validateLeadInput({ ...valid, phone: '123' }).errors.phone).toBeDefined();
  });

  it('requires a job description of 10–1000 characters', () => {
    expect(validateLeadInput({ ...valid, job: 'leak' }).errors.job).toBeDefined();
    expect(validateLeadInput({ ...valid, job: 'x'.repeat(1001) }).errors.job).toBeDefined();
  });

  it('rejects an unknown urgency value', () => {
    // @ts-expect-error testing runtime guard
    expect(validateLeadInput({ ...valid, urgency: 'asap' }).errors.urgency).toBeDefined();
  });

  it('accepts an optional email only when well-formed', () => {
    expect(validateLeadInput({ ...valid, email: 'sam@example.com' }).ok).toBe(true);
    expect(validateLeadInput({ ...valid, email: 'sam@' }).errors.email).toBeDefined();
  });
});

describe('validatePhotos', () => {
  const photo = (name: string, type: string, size: number) => ({ name, type, size });

  it('accepts up to the maximum number of supported images', () => {
    const files = Array.from({ length: PHOTO_LIMITS.maxCount }, (_, i) => photo(`p${i}.jpg`, 'image/jpeg', 1000));
    expect(validatePhotos(files)).toBeNull();
  });

  it('rejects more than the maximum', () => {
    const files = Array.from({ length: PHOTO_LIMITS.maxCount + 1 }, (_, i) => photo(`p${i}.jpg`, 'image/jpeg', 1000));
    expect(validatePhotos(files)).toMatch(/up to/i);
  });

  it('rejects unsupported types and oversized files', () => {
    expect(validatePhotos([photo('a.pdf', 'application/pdf', 1000)])).toMatch(/photo/i);
    expect(validatePhotos([photo('a.jpg', 'image/jpeg', PHOTO_LIMITS.maxBytes + 1)])).toMatch(/10 ?MB/i);
  });

  it('accepts HEIC by extension when the browser gives no type', () => {
    expect(validatePhotos([photo('IMG_1.HEIC', '', 2000)])).toBeNull();
  });
});

describe('isLikelySpam', () => {
  it('flags a filled honeypot', () => {
    expect(isLikelySpam({ honeypot: 'http://x', startedAt: 0, now: 10_000 })).toBe(true);
  });
  it('flags submissions faster than 3 seconds', () => {
    expect(isLikelySpam({ honeypot: '', startedAt: 1000, now: 2500 })).toBe(true);
  });
  it('lets a normal submission through', () => {
    expect(isLikelySpam({ honeypot: '', startedAt: 0, now: 20_000 })).toBe(false);
  });
});
