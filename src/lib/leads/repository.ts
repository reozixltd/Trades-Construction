/**
 * The storage contract for leads. The form and console depend only on this
 * interface, so swapping the demo store for a real API is a one-line change
 * in ./index.ts.
 */
import type { Lead, LeadInput, LeadStatus } from './types';

export interface LeadRepository {
  create(input: LeadInput): Promise<Lead>;
  list(): Promise<Lead[]>;
  get(id: string): Promise<Lead | null>;
  updateStatus(id: string, status: LeadStatus): Promise<Lead>;
  addNote(id: string, note: string): Promise<Lead>;
  clear(): Promise<void>;
}

export class RateLimitError extends Error {
  constructor() {
    super('Too many requests from this device. Please call us instead.');
    this.name = 'RateLimitError';
  }
}
