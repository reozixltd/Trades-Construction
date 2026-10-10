/**
 * Prepares background video for the site: `npm run media`.
 *
 * Reads the source clips in media-src/flow/ (not committed) and writes, for each one found:
 *   public/videos/<name>.mp4       1080p H.264, no audio, starts playing before fully downloaded
 *   public/videos/<name>-720.mp4   smaller file for phones
 *   src/assets/photos/<poster>.jpg first frame, shown before the video plays and instead of it
 * The last second of each clip dissolves into its first, so the loop has no visible cut.
 *
 * Any other .jpg in media-src/flow/ is a photo slot (src/config/photo-slots.ts) and is copied to
 * src/assets/photos/ under the same name, at most 2000px wide.
 *
 * Needs ffmpeg on PATH, or its full path in the FFMPEG environment variable.
 * Clip names and poster slots mirror src/config/media.ts.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const clips = {
  // `end` (seconds) drops the rest of a take: after 7.5s the camera has carried the carpenter in behind the headline.
  'ft-hero-site': { poster: 'hero-poster', end: 7.5 },
  'ft-craft-joinery': { poster: 'cta-poster' },
  'ft-showcase-kitchen': { poster: 'showcase-poster' },
};

const ffmpeg = process.env.FFMPEG || 'ffmpeg';
const run = (args) => {
  const r = spawnSync(ffmpeg, ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' });
  if (r.error) throw new Error(`Could not run ffmpeg (${r.error.message}). Install it or set FFMPEG to its path.`);
  if (r.status !== 0) throw new Error(`ffmpeg failed on: ${args.join(' ')}`);
};
const mb = (file) => `${(statSync(file).size / 1e6).toFixed(1)} MB`;
const FADE = 1; // seconds of the clip's end dissolved into its start
const seconds = (src) => {
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(spawnSync(ffmpeg, ['-i', src], { encoding: 'utf8' }).stderr ?? '');
  if (!m) throw new Error(`Could not read the length of ${src}.`);
  return m[1] * 3600 + m[2] * 60 + Number(m[3]);
};
const encode = (src, out, width, crf, end) => {
  const loop = `[0:v]scale='min(${width},iw)':-2,split[a][b];[a]trim=start=${FADE}:end=${end},setpts=PTS-STARTPTS[body];[b]trim=end=${FADE},setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=${FADE}:offset=${end - 2 * FADE}`;
  run(['-i', src, '-an', '-filter_complex', loop, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
};
const photo = (args, out) => run([...args, '-frames:v', '1', '-vf', "scale='min(2000,iw)':-2", '-q:v', '3', out]);

process.chdir(join(dirname(fileURLToPath(import.meta.url)), '..'));
mkdirSync('public/videos', { recursive: true });
let found = 0;
for (const [name, { poster, end = Infinity }] of Object.entries(clips)) {
  const src = join('media-src', 'flow', `${name}.mp4`);
  if (!existsSync(src)) {
    console.log(`- ${name}: no source at ${src}, skipped`);
    continue;
  }
  found++;
  const full = join('public', 'videos', `${name}.mp4`);
  const small = join('public', 'videos', `${name}-720.mp4`);
  const still = join('src', 'assets', 'photos', `${poster}.jpg`);
  const length = Math.min(end, seconds(src));
  encode(src, full, 1920, 24, length);
  encode(src, small, 1280, 27, length);
  // A still exported from the same take wins over the frame the loop starts on.
  const supplied = join('media-src', 'flow', `${name}-poster.jpg`);
  photo(existsSync(supplied) ? ['-i', supplied] : ['-ss', String(FADE), '-i', src], still);
  console.log(`✓ ${name}: ${mb(full)} (1080p), ${mb(small)} (720p), poster ${still}`);
}
for (const file of existsSync('media-src/flow') ? readdirSync('media-src/flow') : []) {
  if (!file.endsWith('.jpg') || file.endsWith('-poster.jpg')) continue;
  photo(['-i', join('media-src', 'flow', file)], join('src', 'assets', 'photos', file));
  found++;
  console.log(`✓ photo ${file}`);
}
if (!found) console.log('Nothing to do. Put the clips and photos in media-src/flow/ (names are in docs/redesign-plan.md).');
