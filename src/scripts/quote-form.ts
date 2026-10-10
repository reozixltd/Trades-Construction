/**
 * Quote form controller: collects fields, validates (lib/leads/validation),
 * saves through the LeadRepository, then shows the confirmation.
 * No business rules live here — only DOM wiring.
 */
import { areaHint, checkArea, isOutOfArea, type AreaLists } from '@/lib/areas';
import { isStoragePersistent } from '@/lib/storage';
import { track } from '@/lib/analytics';
import { getLeadRepository, RateLimitError, type LeadInput, type PropertyType, type Urgency } from '@/lib/leads';
import { isLikelySpam, normalisePhone, PHOTO_LIMITS, validateLeadInput, validatePhotos } from '@/lib/leads/validation';
import { downscale } from './photos';

document.querySelectorAll<HTMLElement>('[data-quote-form]').forEach(initQuoteForm);

function initQuoteForm(root: HTMLElement): void {
  const form = root.querySelector<HTMLFormElement>('form');
  const done = root.querySelector<HTMLElement>('[data-done]');
  if (!form || !done) return;

  const areas = JSON.parse(root.dataset.areas ?? '{"covered":[],"nearby":[]}') as AreaLists;
  const startedAt = Date.now();
  const photos: File[] = [];
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]')!;
  const thumbs = form.querySelector<HTMLUListElement>('[data-thumbs]')!;
  const suburbInput = form.elements.namedItem('suburb') as HTMLInputElement;
  const suburbNote = form.querySelector<HTMLElement>('[data-suburb-note]')!;

  prefillFromUrl(form);

  // ── Validate a required field when the person leaves it (after they've typed something) ──
  (['name', 'phone', 'job', 'email'] as const).forEach((field) => {
    const input = form.elements.namedItem(field) as HTMLInputElement | null;
    input?.addEventListener('blur', () => {
      if (!input.value.trim() && field === 'email') return setError(form, field, null);
      if (!input.value.trim() && input.getAttribute('aria-invalid') !== 'true') return;
      setError(form, field, validateLeadInput(readInput(form)).errors[field] ?? null);
    });
  });

  // ── Photos ────────────────────────────────────────────
  fileInput.addEventListener('change', () => {
    const next = [...photos, ...Array.from(fileInput.files ?? [])];
    const error = validatePhotos(next);
    setError(form, 'photos', error);
    if (!error) {
      photos.splice(0, photos.length, ...next);
      renderThumbs(thumbs, photos);
    }
    fileInput.value = '';
  });
  thumbs.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('button[data-index]');
    if (!btn) return;
    photos.splice(Number(btn.dataset.index), 1);
    renderThumbs(thumbs, photos);
    setError(form, 'photos', null);
  });

  // ── Suburb hint ───────────────────────────────────────
  suburbInput.addEventListener('blur', () => {
    const value = suburbInput.value.trim();
    if (!value) return void (suburbNote.textContent = '');
    suburbNote.textContent = areaHint(checkArea(value, areas).status);
  });

  // ── Submit ────────────────────────────────────────────
  // Pressing the button must not blur the field being edited: the blur clears that field's error, the page moves
  // up under the pointer, and Safari (no scroll anchoring) drops the click. Submit validates every field anyway.
  form.querySelector('button[type="submit"]')!.addEventListener('mousedown', (e) => e.preventDefault());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.replaceChildren();
    const input = readInput(form);
    const { ok, errors } = validateLeadInput(input);
    (['name', 'phone', 'job', 'email'] as const).forEach((f) => setError(form, f, errors[f] ?? null));
    renderSummary(form, errors);
    if (!ok) return;

    const honeypot = (form.elements.namedItem('website') as HTMLInputElement).value;
    if (isLikelySpam({ honeypot, startedAt, now: Date.now() })) {
      showStatus(status, root, 'Please wait a moment and try again.');
      return;
    }

    // Demo storage unavailable (private mode, blocked storage): don't pretend the request was saved.
    if (!isStoragePersistent()) {
      showStatus(status, root, 'This browser can’t save your request.');
      return;
    }

    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const label = submit.querySelector('span');
    const idleText = label?.textContent ?? '';
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    if (label) label.textContent = 'Sending…';
    try {
      const encoded = await Promise.all(photos.map(downscale));
      const attached = encoded.filter((p): p is string => p !== null);
      const area = input.suburb ? checkArea(input.suburb, areas) : null;
      const lead = await getLeadRepository().create({
        ...input,
        phone: normalisePhone(input.phone) ?? input.phone,
        photos: attached,
        photosNotAttached: photos.length - attached.length || undefined,
        outOfArea: area ? isOutOfArea(area.status) : false,
        source: form.dataset.source,
      });
      track('quote_submit');
      showDone(root, form, done, {
        name: lead.name.split(' ')[0] ?? lead.name,
        ref: lead.id,
        outOfArea: lead.outOfArea,
        photosMissing: (lead.photosNotAttached ?? 0) > 0 || lead.photos.length < attached.length,
      });
    } catch (err) {
      showStatus(status, root, err instanceof RateLimitError || err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
      if (label) label.textContent = idleText;
    }
  });
}

function readInput(form: HTMLFormElement): LeadInput {
  const data = new FormData(form);
  const text = (k: string) => String(data.get(k) ?? '').trim();
  const optional = (k: string) => text(k) || undefined;
  return {
    name: text('name'),
    phone: text('phone'),
    job: text('job'),
    email: optional('email'),
    service: optional('service'),
    suburb: optional('suburb'),
    urgency: optional('urgency') as Urgency | undefined,
    bestTime: optional('bestTime'),
    propertyType: optional('propertyType') as PropertyType | undefined,
  };
}

/** Error summary (UI/UX Pro Max: focusable error summary): links to each invalid field, takes focus on failed submit. */
function renderSummary(form: HTMLFormElement, errors: Partial<Record<string, string>>): void {
  const box = form.querySelector<HTMLElement>('[data-error-summary]');
  const list = box?.querySelector('[data-error-list]');
  if (!box || !list) return;
  const entries = Object.entries(errors).filter(([, msg]) => msg);
  list.replaceChildren(
    ...entries.map(([field, msg]) => {
      const a = Object.assign(document.createElement('a'), { href: `#q-${field}`, textContent: msg! });
      a.addEventListener('click', (e) => {
        e.preventDefault();
        (form.elements.namedItem(field) as HTMLElement | null)?.focus();
      });
      const li = document.createElement('li');
      li.append(a);
      return li;
    }),
  );
  box.hidden = entries.length === 0;
  if (entries.length) box.focus();
}

function prefillFromUrl(form: HTMLFormElement): void {
  const params = new URLSearchParams(location.search);
  const service = params.get('service');
  const suburb = params.get('suburb');
  const select = form.elements.namedItem('service') as HTMLSelectElement;
  if (service && [...select.options].some((o) => o.value === service)) select.value = service;
  if (suburb) (form.elements.namedItem('suburb') as HTMLInputElement).value = suburb;
  if (service || suburb) form.querySelector('details')?.setAttribute('open', '');
}

function setError(form: HTMLFormElement, field: string, message: string | null): void {
  const el = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
  if (el) el.textContent = message ?? '';
  const input = form.elements.namedItem(field);
  if (input instanceof HTMLElement) input.setAttribute('aria-invalid', String(Boolean(message)));
}

function renderThumbs(list: HTMLUListElement, files: File[]): void {
  list.replaceChildren(
    ...files.map((file, i) => {
      const li = document.createElement('li');
      if (/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
        const img = document.createElement('img');
        img.alt = file.name;
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        li.append(img);
      } else {
        const name = document.createElement('span');
        name.className = 'thumbs__name';
        name.textContent = file.name;
        li.append(name);
      }
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.dataset.index = String(i);
      remove.setAttribute('aria-label', `Remove ${file.name}`);
      remove.textContent = '×';
      li.append(remove);
      return li;
    }),
  );
  list.setAttribute('aria-label', `${files.length} of ${PHOTO_LIMITS.maxCount} photos added`);
}

/** Shows an error with a tap-to-call fallback, so a failed submit never strands the customer. */
function showStatus(status: HTMLElement, root: HTMLElement, message: string): void {
  const call = Object.assign(document.createElement('a'), { href: root.dataset.tel ?? '', textContent: root.dataset.phone ?? '' });
  status.replaceChildren(`${message.replace(/\s*Please call us( instead)?\.?$/, '')} Please call `, call, '.');
}

interface DoneInfo {
  name: string;
  ref: string;
  outOfArea: boolean;
  photosMissing: boolean;
}

function showDone(root: HTMLElement, form: HTMLFormElement, done: HTMLElement, info: DoneInfo): void {
  done.querySelector('[data-done-name]')!.textContent = info.name;
  done.querySelector('[data-done-ref]')!.textContent = info.ref;
  done.querySelector<HTMLElement>('[data-done-out]')!.hidden = !info.outOfArea;
  done.querySelector<HTMLElement>('[data-done-photos]')!.hidden = !info.photosMissing;
  form.hidden = true;
  done.hidden = false;
  done.focus();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
