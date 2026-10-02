/** Lead list + KPI rendering. */
import { getCollectionTitles } from './services';
import { el } from './dom';
import { formatDateTime } from '@/lib/format';
import { STATUS_LABELS, URGENCY_LABELS, type Lead, type LeadStatus } from '@/lib/leads/types';
import { OPEN_STATUSES } from '@/lib/leads';
import { readCounters } from '@/lib/analytics';

export function renderKpis(root: HTMLElement, leads: Lead[]): void {
  const set = (key: string, value: number) => {
    const node = root.querySelector(`[data-kpi="${key}"]`);
    if (node) node.textContent = String(value);
  };
  set('new', leads.filter((l) => l.status === 'new').length);
  set('open', leads.filter((l) => OPEN_STATUSES.includes(l.status)).length);
  set('won', leads.filter((l) => l.status === 'won').length);
  const counters = readCounters();
  set('calls', counters.call_click);
  set('forms', counters.quote_submit);

  const badge = document.querySelector<HTMLElement>('[data-new-count]');
  const newCount = leads.filter((l) => l.status === 'new').length;
  if (badge) {
    badge.textContent = String(newCount);
    badge.hidden = newCount === 0;
  }
}

export function statusTag(status: LeadStatus): HTMLElement {
  const tone = status === 'new' ? 'tag--new' : status === 'won' ? 'tag--won' : status === 'lost' ? 'tag--lost' : '';
  return el('span', { class: `tag ${tone}` }, STATUS_LABELS[status]);
}

export function renderList(list: HTMLElement, leads: Lead[], selectedId: string | null): void {
  const titles = getCollectionTitles();
  list.replaceChildren(
    ...leads.map((lead) =>
      el(
        'li',
        {},
        el(
          'button',
          { type: 'button', class: 'lead-row', 'data-lead-id': lead.id, 'aria-current': lead.id === selectedId ? 'true' : undefined },
          el('span', { class: 'lead-row__name' }, lead.name),
          el('span', { class: 'lead-row__time' }, formatDateTime(lead.createdAt)),
          el('span', { class: 'lead-row__job' }, lead.job),
          el(
            'span',
            { class: 'lead-row__tags' },
            statusTag(lead.status),
            lead.urgency === 'emergency' && el('span', { class: 'tag tag--emergency' }, URGENCY_LABELS.emergency),
            lead.service && el('span', { class: 'tag' }, titles[lead.service] ?? lead.service),
            lead.suburb && el('span', { class: lead.outOfArea ? 'tag tag--warn' : 'tag' }, lead.outOfArea ? `${lead.suburb} · outside area` : lead.suburb),
            lead.photos.length > 0 && el('span', { class: 'tag' }, `${lead.photos.length} photo${lead.photos.length > 1 ? 's' : ''}`),
          ),
        ),
      ),
    ),
  );
}
