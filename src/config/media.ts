/**
 * Background video clips. `file` is the name in public/videos/ (without .mp4; an optional
 * `<file>-720.mp4` is used on narrow screens). `poster` is a photo slot cut from the clip;
 * `fallback` is the photo slot used while there is no clip and no poster.
 */
import type { PhotoSlotName } from './photo-slots';

interface VideoClip {
  file: string;
  poster: PhotoSlotName;
  fallback?: PhotoSlotName;
}

export const videos = {
  hero: { file: 'ft-hero-site', poster: 'hero-poster', fallback: 'hero' },
  cta: { file: 'ft-craft-joinery', poster: 'cta-poster', fallback: 'service-carpentry-and-joinery' },
  showcase: { file: 'ft-showcase-kitchen', poster: 'showcase-poster' },
} satisfies Record<string, VideoClip>;

export type VideoName = keyof typeof videos;
