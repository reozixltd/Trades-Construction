/**
 * Applies the owner's console settings to the public page:
 *   [data-live="emergency"]       shown only while emergency mode is on
 *   [data-live="callback"]        text replaced with the callback promise
 *   [data-live="emergency-option"] form option enabled only in emergency mode
 */
import { business } from '@/config/business';
import { getStorage } from '@/lib/storage';
import { SettingsStore, type LiveSettings } from '@/lib/settings';

export function getSettingsStore(): SettingsStore {
  return new SettingsStore(getStorage(), business.defaults);
}

export function applyLiveSettings(settings: LiveSettings = getSettingsStore().get(), root: ParentNode = document): void {
  document.documentElement.classList.toggle('emergency-off', !settings.emergencyEnabled);
  root.querySelectorAll<HTMLElement>('[data-live="emergency"]').forEach((el) => {
    el.hidden = !settings.emergencyEnabled;
  });
  root.querySelectorAll<HTMLElement>('[data-live="callback"]').forEach((el) => {
    el.textContent = settings.callbackPromise;
  });
  root.querySelectorAll<HTMLInputElement>('[data-live="emergency-option"]').forEach((input) => {
    input.disabled = !settings.emergencyEnabled;
    input.closest<HTMLElement>('label')?.toggleAttribute('hidden', !settings.emergencyEnabled);
  });
}
