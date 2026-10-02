import { beforeEach, describe, expect, it } from 'vitest';
import { LocalLeadRepository } from '@/lib/leads/local-repository';
import { createMemoryStorage } from '@/lib/storage';

const input = { name: 'Sam Lee', phone: '0491570156', job: 'Leaking shower through the wall' };

describe('LocalLeadRepository', () => {
  let clock = 1_000_000;
  let repo: LocalLeadRepository;

  beforeEach(() => {
    clock = 1_000_000;
    repo = new LocalLeadRepository(createMemoryStorage(), () => clock);
  });

  it('creates a lead with id, New status and timestamp', async () => {
    const lead = await repo.create(input);
    expect(lead.id).toMatch(/^L-/);
    expect(lead.status).toBe('new');
    expect(lead.createdAt).toBe(new Date(clock).toISOString());
  });

  it('lists newest first', async () => {
    await repo.create({ ...input, name: 'First' });
    clock += 60_000;
    await repo.create({ ...input, name: 'Second' });
    const leads = await repo.list();
    expect(leads.map((l) => l.name)).toEqual(['Second', 'First']);
  });

  it('updates status and records it in the history', async () => {
    const lead = await repo.create(input);
    clock += 1000;
    const updated = await repo.updateStatus(lead.id, 'contacted');
    expect(updated.status).toBe('contacted');
    expect(updated.history.at(-1)).toMatchObject({ type: 'status', value: 'contacted' });
  });

  it('adds a note', async () => {
    const lead = await repo.create(input);
    const updated = await repo.addNote(lead.id, 'Booked site visit Tue 9am');
    expect(updated.history.at(-1)).toMatchObject({ type: 'note', value: 'Booked site visit Tue 9am' });
  });

  it('throws on an unknown id', async () => {
    await expect(repo.updateStatus('L-nope', 'won')).rejects.toThrow(/not found/i);
  });

  it('rate-limits after 5 submissions in an hour, then recovers', async () => {
    for (let i = 0; i < 5; i++) await repo.create(input);
    await expect(repo.create(input)).rejects.toThrow(/too many/i);
    clock += 61 * 60_000;
    await expect(repo.create(input)).resolves.toBeDefined();
  });

  it('keeps working when storage contains corrupt data', async () => {
    const storage = createMemoryStorage();
    storage.setItem('ft.leads', '{not json');
    const r = new LocalLeadRepository(storage, () => clock);
    expect(await r.list()).toEqual([]);
  });

  it('clears all leads', async () => {
    await repo.create(input);
    await repo.clear();
    expect(await repo.list()).toEqual([]);
  });
});
