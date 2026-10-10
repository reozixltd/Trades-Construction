/** Lead detail panel: contact actions, facts, photos, status pipeline, notes and history. */
import { el } from './dom';
import { getCollectionTitles } from './services';
import { statusTag } from './inbox';
import { formatDateTime, formatPhone, smsHref, telHref } from '@/lib/format';
import { LEAD_STATUSES, STATUS_LABELS, URGENCY_LABELS, type Lead, type LeadStatus } from '@/lib/leads/types';

export interface DetailHandlers {
  onStatus(id: string, status: LeadStatus): void;
  onNote(id: string, note: string): void;
  onClose(): void;
}

export function renderDetail(panel: HTMLElement, lead: Lead, handlers: DetailHandlers): void {
  const titles = getCollectionTitles();
  const fact = (label: string, value?: string) => (value ? [el('dt', {}, label), el('dd', {}, value)] : []);

  const pipeline = el(
    'div',
    { class: 'pipeline', role: 'group', 'aria-label': 'Lead status' },
    ...LEAD_STATUSES.map((s) => el('button', { type: 'button', 'aria-pressed': String(s === lead.status), 'data-set-status': s }, STATUS_LABELS[s])),
  );

  const noteInput = el('input', { type: 'text', name: 'note', placeholder: 'Add a note, e.g. “Site visit Tue 9am”', 'aria-label': 'Note' });
  const noteForm = el('form', { class: 'note-form' }, noteInput, el('button', { type: 'submit' }, 'Add'));

  const history = el(
    'ol',
    { class: 'history' },
    el('li', {}, el('time', {}, formatDateTime(lead.createdAt)), `Request received${lead.source ? ` (${lead.source})` : ''}`),
    ...lead.history.map((h) =>
      el('li', { class: h.type === 'status' ? 'is-status' : '' }, el('time', {}, formatDateTime(h.at)), h.type === 'status' ? `Status → ${STATUS_LABELS[h.value as LeadStatus] ?? h.value}` : h.value),
    ),
  );

  panel.replaceChildren(
    el(
      'div',
      { class: 'detail__head' },
      el('div', {}, el('h2', { class: 'detail__name' }, lead.name), el('p', { class: 'detail__ref' }, `${lead.id} · ${formatDateTime(lead.createdAt)}`)),
      el('div', {}, statusTag(lead.status)),
      el('button', { type: 'button', class: 'detail__close', 'aria-label': 'Close lead', 'data-close': true }, '×'),
    ),
    el(
      'div',
      { class: 'detail__actions' },
      el('a', { class: 'detail__action detail__action--primary', href: telHref(lead.phone) }, 'Call', el('span', {}, formatPhone(lead.phone))),
      el('a', { class: 'detail__action', href: smsHref(lead.phone) }, 'SMS'),
      el('a', { class: 'detail__action', href: lead.email ? `mailto:${lead.email}` : undefined, 'aria-disabled': lead.email ? undefined : 'true' }, 'Email'),
    ),
    el('p', { class: 'detail__job' }, lead.job),
    el(
      'dl',
      { class: 'detail__facts' },
      ...fact('Service', lead.service ? titles[lead.service] ?? lead.service : undefined),
      ...fact('Suburb', lead.suburb ? `${lead.suburb}${lead.outOfArea ? ' (outside area)' : ''}` : undefined),
      ...fact('Urgency', lead.urgency ? URGENCY_LABELS[lead.urgency] : undefined),
      ...fact('Best time', lead.bestTime),
      ...fact('Property', lead.propertyType ? lead.propertyType[0]!.toUpperCase() + lead.propertyType.slice(1) : undefined),
      ...fact('Email', lead.email),
    ),
    lead.photosNotAttached
      ? el('p', { class: 'tag tag--warn' }, `${lead.photosNotAttached} photo(s) couldn’t be attached — ask for them on the call`)
      : '',
    lead.photos.length > 0
      ? el('div', { class: 'detail__photos' }, ...lead.photos.map((src, i) => el('figure', {}, el('img', { src, alt: `Photo ${i + 1} from ${lead.name}` }))))
      : '',
    el('section', { class: 'detail__section' }, el('h3', {}, 'Status'), pipeline),
    el('section', { class: 'detail__section' }, el('h3', {}, 'Notes & history'), noteForm, history),
  );

  pipeline.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('[data-set-status]');
    if (btn) handlers.onStatus(lead.id, btn.dataset.setStatus as LeadStatus);
  });
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = noteInput.value.trim();
    if (value) handlers.onNote(lead.id, value);
  });
  panel.querySelector('[data-close]')?.addEventListener('click', handlers.onClose);
}
