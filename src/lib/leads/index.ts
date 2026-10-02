/**
 * The single place that decides which lead store the site uses.
 * Production: replace LocalLeadRepository with an HttpLeadRepository that
 * implements the same LeadRepository interface (POST /api/leads etc.).
 */
import { getStorage } from '../storage';
import { LocalLeadRepository } from './local-repository';
import type { LeadRepository } from './repository';
import type { Lead, LeadStatus } from './types';

let repo: LocalLeadRepository | null = null;

export function getLeadRepository(): LeadRepository {
  repo ??= new LocalLeadRepository(getStorage());
  return repo;
}

/** Demo-only: loads sample leads. Not part of LeadRepository, so production stores don't need it. */
export async function seedDemoLeads(leads: Lead[]): Promise<void> {
  repo ??= new LocalLeadRepository(getStorage());
  await repo.seed(leads);
}

/** Groups used by console KPIs. */
export const OPEN_STATUSES: readonly LeadStatus[] = ['contacted', 'site-visit', 'quoted'];

export * from './types';
export { RateLimitError } from './repository';
