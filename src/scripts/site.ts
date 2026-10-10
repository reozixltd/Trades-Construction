/** Site-wide behaviour, loaded on every page: live owner settings, call tracking, header state, mobile menu. */
import { applyLiveSettings } from './live-settings';
import { track } from '@/lib/analytics';

applyLiveSettings();

document.addEventListener('click', (e) => {
  const link = (e.target as Element | null)?.closest?.('a[href^="tel:"]');
  if (link) track('call_click');
});

/* Header: solid once the page has scrolled (only matters where it overlays a dark hero). */
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  const onScroll = () => header.toggleAttribute('data-scrolled', scrollY > 96);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Mobile menu: a modal <dialog>, so the focus trap, Escape and the return of focus are the browser's. The toggle
   is focused first because Safari does not focus a button on click, which leaves the dialog nowhere to return to. */
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    toggle.focus();
    menu.showModal();
    toggle.setAttribute('aria-expanded', 'true');
  });
  menu.querySelector('[data-menu-close]')?.addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => {
    toggle.setAttribute('aria-expanded', 'false');
  });
  matchMedia('(min-width: 1024px)').addEventListener('change', (e) => e.matches && menu.close());
}
