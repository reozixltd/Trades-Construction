/** Settings tab: emergency toggle + callback promise, plus demo-data tools. */
import { getSettingsStore } from '../live-settings';

export function initSettings(form: HTMLFormElement): void {
  const store = getSettingsStore();
  const emergency = form.elements.namedItem('emergencyEnabled') as HTMLInputElement;
  const promise = form.elements.namedItem('callbackPromise') as HTMLInputElement;
  const saved = form.querySelector<HTMLElement>('[data-saved]');

  const load = () => {
    const s = store.get();
    emergency.checked = s.emergencyEnabled;
    promise.value = s.callbackPromise;
  };
  load();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    store.save({ emergencyEnabled: emergency.checked, callbackPromise: promise.value });
    load();
    if (saved) {
      saved.textContent = 'Saved. The website now shows these settings.';
      setTimeout(() => (saved.textContent = ''), 4000);
    }
  });
}
