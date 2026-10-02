/** Quote-form validation and spam heuristics. Pure functions; messages are customer-facing. */
import { PROPERTY_TYPES, URGENCIES, type LeadInput } from './types';

export const PHOTO_LIMITS = {
  maxCount: 5,
  maxBytes: 10 * 1024 * 1024,
  types: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  extensions: /\.(jpe?g|png|webp|heic|heif)$/i,
} as const;

export const JOB_LENGTH = { min: 10, max: 1000 } as const;
const MIN_FILL_MS = 3000;

export type FieldErrors = Partial<Record<keyof LeadInput, string>>;

/** Returns AU numbers as 10 digits starting with 0, or null if not a valid AU phone. */
export function normalisePhone(raw: string): string | null {
  let digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+61')) digits = '0' + digits.slice(3);
  else if (digits.startsWith('61') && digits.length === 11) digits = '0' + digits.slice(2);
  if (digits.startsWith('+')) return null;
  return /^0[2-478]\d{8}$/.test(digits) ? digits : null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLeadInput(input: LeadInput): { ok: boolean; errors: FieldErrors } {
  const errors: FieldErrors = {};

  if (input.name.trim().length < 2) errors.name = 'Please enter your name.';
  if (!normalisePhone(input.phone)) errors.phone = 'Please enter an Australian phone number, e.g. 0412 345 678.';

  const job = input.job.trim();
  if (job.length < JOB_LENGTH.min) errors.job = 'Tell us a little more about the job (at least 10 characters).';
  else if (job.length > JOB_LENGTH.max) errors.job = `Please keep this under ${JOB_LENGTH.max} characters — you can add photos instead.`;

  if (input.email && !EMAIL.test(input.email.trim())) errors.email = 'That email address doesn’t look right.';
  if (input.urgency && !URGENCIES.includes(input.urgency)) errors.urgency = 'Please choose how soon you need this.';
  if (input.propertyType && !PROPERTY_TYPES.includes(input.propertyType)) errors.propertyType = 'Please choose a property type.';

  return { ok: Object.keys(errors).length === 0, errors };
}

export interface PhotoMeta {
  name: string;
  type: string;
  size: number;
}

/** Returns an error message, or null when the photos are acceptable. */
export function validatePhotos(files: readonly PhotoMeta[]): string | null {
  if (files.length > PHOTO_LIMITS.maxCount) return `You can add up to ${PHOTO_LIMITS.maxCount} photos.`;
  for (const f of files) {
    const typeOk = (PHOTO_LIMITS.types as readonly string[]).includes(f.type) || PHOTO_LIMITS.extensions.test(f.name);
    if (!typeOk) return `“${f.name}” isn’t a photo. Please use JPG, PNG, WebP or HEIC.`;
    if (f.size > PHOTO_LIMITS.maxBytes) return `“${f.name}” is over 10 MB. Please choose a smaller photo.`;
  }
  return null;
}

export function isLikelySpam(opts: { honeypot: string; startedAt: number; now: number }): boolean {
  return opts.honeypot.trim() !== '' || opts.now - opts.startedAt < MIN_FILL_MS;
}
