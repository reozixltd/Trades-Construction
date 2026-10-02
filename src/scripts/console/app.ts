/** Console entry: demo sign-in, tabs, and wiring the inbox, detail and settings modules together. */
import '@/styles/console.css';
import { getLeadRepository, seedDemoLeads, type Lead, type LeadStatus } from '@/lib/leads';
import { COUNTERS_KEY } from '@/lib/analytics';
import { SETTINGS_KEY } from '@/lib/settings';
import { DEMO_CREDENTIALS as DEMO, SESSION_KEY } from './demo-auth';
import { leadsToCsv } from '@/lib/leads/csv';
import { getStorage } from '@/lib/storage';
import { renderKpis, renderList } from './inbox';
import { renderDetail } from './lead-detail';
import { initSettings } from './settings-panel';
import { sampleLeads } from './sample-data';


const repo = getLeadRepository();
const storage = getStorage();
const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

const state: { leads: Lead[]; filter: LeadStatus | 'all'; selected: string | null } = { leads: [], filter: 'all', selected: null };

// ── Sign-in (demo only) ─────────────────────────────────
function showApp(signedIn: boolean): void {
  $('[data-view="signin"]').hidden = signedIn;
  $('[data-view="app"]').hidden = !signedIn;
  if (signedIn) void refresh();
}

$<HTMLFormElement>('[data-signin]').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget as HTMLFormElement);
  if (data.get('email') === DEMO.email && data.get('password') === DEMO.password) {
    storage.setItem(SESSION_KEY, '1');
    showApp(true);
  } else {
    $('[data-signin-error]').textContent = 'Use the demo email and password shown above.';
  }
});

$('[data-signout]').addEventListener('click', () => {
  storage.removeItem(SESSION_KEY);
  showApp(false);
});

// ── Tabs (WAI-ARIA tabs pattern: click, or arrow keys / Home / End) ──
const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-tab]')];

function selectTab(tab: HTMLButtonElement, focus = false): void {
  tabs.forEach((t) => {
    const active = t === tab;
    t.setAttribute('aria-selected', String(active));
    t.tabIndex = active ? 0 : -1;
    $(`[data-panel="${t.dataset.tab}"]`).hidden = !active;
  });
  if (focus) tab.focus();
  if (tab.dataset.tab === 'leads') void refresh();
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    selectTab(tabs[(next + tabs.length) % tabs.length]!, true);
  });
});

// ── Leads ───────────────────────────────────────────────
async function refresh(): Promise<void> {
  state.leads = await repo.list();
  render();
}

function render(): void {
  const visible = state.filter === 'all' ? state.leads : state.leads.filter((l) => l.status === state.filter);
  renderKpis($('[data-kpis]'), state.leads);
  renderList($('[data-lead-list]'), visible, state.selected);
  $('[data-empty]').hidden = visible.length > 0;

  const panel = $('[data-detail]');
  const lead = state.leads.find((l) => l.id === state.selected);
  panel.hidden = !lead;
  if (lead) {
    renderDetail(panel, lead, {
      onStatus: (id, status) => save(() => repo.updateStatus(id, status)),
      onNote: (id, note) => save(() => repo.addNote(id, note)),
      onClose: () => {
        state.selected = null;
        render();
      },
    });
  }
}

async function save(change: () => Promise<unknown>): Promise<void> {
  try {
    await change();
  } catch (err) {
    $('[data-detail]').prepend(Object.assign(document.createElement('p'), { className: 'tag tag--emergency', textContent: err instanceof Error ? err.message : 'Could not save.' }));
    return;
  }
  await refresh();
}

$('[data-lead-list]').addEventListener('click', (e) => {
  const row = (e.target as Element).closest<HTMLElement>('[data-lead-id]');
  if (!row) return;
  state.selected = row.dataset.leadId ?? null;
  render();
  const panel = $('[data-detail]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.matchMedia('(max-width: 1023px)').matches) panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  panel.focus({ preventScroll: true });
});

$('[data-status-filter]').addEventListener('click', (e) => {
  const btn = (e.target as Element).closest<HTMLButtonElement>('[data-status]');
  if (!btn) return;
  state.filter = btn.dataset.status as LeadStatus | 'all';
  document.querySelectorAll('[data-status]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  render();
});

$('[data-export]').addEventListener('click', () => {
  const blob = new Blob([leadsToCsv(state.leads)], { type: 'text/csv;charset=utf-8' });
  const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `leads-${new Date().toISOString().slice(0, 10)}.csv` });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

// ── Settings & demo data ────────────────────────────────
initSettings($<HTMLFormElement>('[data-settings]'));

$('[data-seed]').addEventListener('click', async () => {
  const existing = new Set(state.leads.map((l) => l.id));
  await seedDemoLeads(sampleLeads().filter((l) => !existing.has(l.id)));
  selectTab(tabs[0]!);
});

$('[data-clear]').addEventListener('click', async () => {
  await repo.clear();
  [COUNTERS_KEY, SETTINGS_KEY].forEach((k) => storage.removeItem(k));
  state.selected = null;
  initSettings($<HTMLFormElement>('[data-settings]'));
  selectTab(tabs[0]!);
});

showApp(storage.getItem(SESSION_KEY) === '1');
