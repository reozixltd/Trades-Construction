/** Owner-editable settings that override the business config defaults. */
import { readJson, writeJson, type KeyValueStorage } from './storage';

export interface LiveSettings {
  emergencyEnabled: boolean;
  callbackPromise: string;
}

export const SETTINGS_KEY = 'ft.settings';

export class SettingsStore {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly defaults: LiveSettings,
  ) {}

  get(): LiveSettings {
    const saved = readJson<Partial<LiveSettings>>(this.storage, SETTINGS_KEY, {});
    return {
      emergencyEnabled: typeof saved.emergencyEnabled === 'boolean' ? saved.emergencyEnabled : this.defaults.emergencyEnabled,
      callbackPromise: saved.callbackPromise?.trim() ? saved.callbackPromise.trim() : this.defaults.callbackPromise,
    };
  }

  save(patch: Partial<LiveSettings>): LiveSettings {
    const next = { ...readJson<Partial<LiveSettings>>(this.storage, SETTINGS_KEY, {}), ...patch };
    writeJson(this.storage, SETTINGS_KEY, next);
    return this.get();
  }

  reset(): void {
    this.storage.removeItem(SETTINGS_KEY);
  }
}
