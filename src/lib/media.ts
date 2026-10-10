/**
 * Background video is optional. A clip counts only if its file is in public/videos/ at
 * build time, so a missing clip never leaves a broken <video> or a 404 — the page shows
 * the poster or the fallback photo instead. See docs/redesign-plan.md for the asset list.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { videos, type VideoName } from '@/config/media';
import { getPhoto } from './photos';
import type { PhotoSlotName } from '@/config/photo-slots';

const file = (name: string) => join(process.cwd(), 'public', 'videos', name);

export interface ResolvedVideo {
  /** URL of the 1080p file, or undefined when the clip hasn't been supplied. */
  src?: string;
  /** URL of the smaller file for narrow screens, when it exists. */
  srcSmall?: string;
  /** Photo shown before the video plays, and instead of it when it can't. */
  still?: PhotoSlotName;
}

export function resolveVideo(name: VideoName): ResolvedVideo {
  const v = videos[name];
  const has = existsSync(file(`${v.file}.mp4`));
  const still = getPhoto(v.poster) ? v.poster : 'fallback' in v ? v.fallback : undefined;
  return {
    src: has ? `/videos/${v.file}.mp4` : undefined,
    srcSmall: has && existsSync(file(`${v.file}-720.mp4`)) ? `/videos/${v.file}-720.mp4` : undefined,
    still,
  };
}
