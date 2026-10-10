/**
 * Prepares background video for the site: `npm run media`.
 *
 * Reads the source clips in media-src/flow/ (not committed) and writes, for each one found:
 *   public/videos/<name>.mp4       1080p H.264, no audio, starts playing before fully downloaded
 *   public/videos/<name>-720.mp4   smaller file for phones
 *   src/assets/photos/<poster>.jpg first frame, shown before the video plays and instead of it
 *
 * Needs ffmpeg on PATH, or its full path in the FFMPEG environment variable.
 * Clip names and poster slots mirror src/config/media.ts.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const clips = {
  'ft-hero-site': 'hero-poster',
  'ft-craft-joinery': 'cta-poster',
  'ft-showcase-kitchen': 'showcase-poster',
};

const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const run = (args) => {
  const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
  if (r.error) throw new Error(`Could not run ffmpeg (${r.error.message}). Install it or set FFMPEG to its path.`);
  if (r.status !== 0) throw new Error(`ffmpeg failed on: ${args.join(' ')}`);
};
const mb = (file) => `${(statSync(file).size / 1e6).toFixed(1)} MB`;
const encode = (src, out, width, crf) =>
  run(['-i', src, '-an', '-vf', `scale='min(${width},iw)':-2`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);

process.chdir(join(dirname(fileURLToPath(import.meta.url)), '..'));
mkdirSync('public/videos', { recursive: true });
let found = 0;
for (const [name, poster] of Object.entries(clips)) {
  const src = join('media-src', 'flow', `${name}.mp4`);
  if (!existsSync(src)) {
    console.log(`- ${name}: no source at ${src}, skipped`);
    continue;
  }
  found++;
  const full = join('public', 'videos', `${name}.mp4`);
  const small = join('public', 'videos', `${name}-720.mp4`);
  const still = join('src', 'assets', 'photos', `${poster}.jpg`);
  encode(src, full, 1920, 24);
  encode(src, small, 1280, 27);
  // A still exported from the same take wins over the clip's first frame.
  const supplied = join('media-src', 'flow', `${name}-poster.jpg`);
  run(['-i', existsSync(supplied) ? supplied : src, '-frames:v', '1', '-vf', "scale='min(2000,iw)':-2", '-q:v', '3', still]);
  console.log(`✓ ${name}: ${mb(full)} (1080p), ${mb(small)} (720p), poster ${still}`);
}
if (!found) console.log('Nothing to do. Put the clips in media-src/flow/ (names are in docs/redesign-plan.md).');
