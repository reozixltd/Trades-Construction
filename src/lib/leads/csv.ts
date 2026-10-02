import { STATUS_LABELS, URGENCY_LABELS, type Lead } from './types';

const COLUMNS: { header: string; value: (l: Lead) => string }[] = [
  { header: 'ID', value: (l) => l.id },
  { header: 'Received', value: (l) => l.createdAt },
  { header: 'Status', value: (l) => STATUS_LABELS[l.status] },
  { header: 'Name', value: (l) => l.name },
  { header: 'Phone', value: (l) => l.phone },
  { header: 'Email', value: (l) => l.email ?? '' },
  { header: 'Service', value: (l) => l.service ?? '' },
  { header: 'Suburb', value: (l) => l.suburb ?? '' },
  { header: 'Out of area', value: (l) => (l.outOfArea ? 'Yes' : 'No') },
  { header: 'Urgency', value: (l) => (l.urgency ? URGENCY_LABELS[l.urgency] : '') },
  { header: 'Job', value: (l) => l.job },
  { header: 'Photos', value: (l) => String(l.photos.length) },
  { header: 'Notes', value: (l) => l.history.filter((h) => h.type === 'note').map((h) => h.value).join(' | ') },
];

/** Quotes every cell, doubles inner quotes, and prefixes formula-like values so spreadsheets don't execute them. */
function cell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function leadsToCsv(leads: readonly Lead[]): string {
  const rows = [COLUMNS.map((c) => cell(c.header)).join(',')];
  for (const lead of leads) rows.push(COLUMNS.map((c) => cell(c.value(lead))).join(','));
  return rows.join('\r\n');
}
