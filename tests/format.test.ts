import { describe, expect, it } from 'vitest';
import { formatPhone, telHref } from '@/lib/format';

describe('formatPhone', () => {
  it('groups mobiles 4-3-3 and landlines 2-4-4', () => {
    expect(formatPhone('0491570156')).toBe('0491 570 156');
    expect(formatPhone('0255504821')).toBe('02 5550 4821');
  });
  it('returns unknown shapes unchanged', () => {
    expect(formatPhone('13 00 00')).toBe('13 00 00');
  });
});

describe('telHref', () => {
  it('builds an international tel: link', () => {
    expect(telHref('02 5550 4821')).toBe('tel:+61255504821');
  });
});
