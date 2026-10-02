/**
 * Resolves a photo slot to an image file in src/assets/photos/, if one exists.
 * Vite's import.meta.glob finds files at build time, so adding a photo needs no code change.
 */
import { photoSlots, type PhotoSlotName } from '@/config/photo-slots';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/photos/*.{jpg,jpeg,png,webp,avif}', { eager: true });

const bySlot = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const slot = path.split('/').pop()!.replace(/\.[a-z]+$/i, '');
  bySlot.set(slot, mod.default);
}

export function getPhoto(slot: PhotoSlotName): ImageMetadata | undefined {
  return bySlot.get(slot);
}

export function photoAlt(slot: PhotoSlotName): string {
  return photoSlots[slot].alt;
}

export function isPhotoSlot(name: string): name is PhotoSlotName {
  return name in photoSlots;
}

/** Slots that still have no file — shown by `npm run photos:status`. */
export function missingSlots(): PhotoSlotName[] {
  return (Object.keys(photoSlots) as PhotoSlotName[]).filter((s) => !bySlot.has(s));
}
