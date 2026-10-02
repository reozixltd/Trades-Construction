import { afterEach, describe, expect, it, vi } from 'vitest';

describe('storage fallback', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('falls back to memory and reports non-persistent when localStorage throws', async () => {
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new Error('blocked');
      },
      getItem: () => null,
      removeItem: () => undefined,
    });
    const { getStorage, isStoragePersistent } = await import('@/lib/storage');
    const s = getStorage();
    s.setItem('k', 'v');
    expect(s.getItem('k')).toBe('v');
    expect(isStoragePersistent()).toBe(false);
  });

  it('reports persistent when localStorage works', async () => {
    const { isStoragePersistent } = await import('@/lib/storage');
    expect(isStoragePersistent()).toBe(true);
  });
});
