/** Display helpers shared by components and scripts. */

/** "02 5550 4821" → "tel:+61255504821" */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `tel:+61${digits.replace(/^0/, '')}`;
}

export function smsHref(phone: string): string {
  return telHref(phone).replace('tel:', 'sms:');
}

/** "0491570156" → "0491 570 156"; "0255504821" → "02 5550 4821". Unknown shapes are returned unchanged. */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (/^04\d{8}$/.test(d)) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  if (/^0[2378]\d{8}$/.test(d)) return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}`;
  return raw;
}

const aud = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });

export function formatAud(amount: number): string {
  return aud.format(amount);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export function slugToTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
