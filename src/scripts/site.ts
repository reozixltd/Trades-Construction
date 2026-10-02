/** Site-wide behaviour, loaded on every page: live owner settings, call tracking, mobile menu. */
import { applyLiveSettings } from './live-settings';
import { track } from '@/lib/analytics';

applyLiveSettings();

document.addEventListener('click', (e) => {
  const link = (e.target as Element | null)?.closest?.('a[href^="tel:"]');
  if (link) track('call_click');
});

const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
    toggle.querySelector('svg')?.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}
