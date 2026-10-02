/** Sample leads for affiliate demos ("Load sample leads" in Settings). Fictional people and numbers. */
import type { Lead } from '@/lib/leads/types';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export function sampleLeads(): Lead[] {
  return [
    {
      id: 'L-SAMPLE1', createdAt: hoursAgo(0.5), status: 'new', name: 'Jess Nguyen', phone: '0491570110', email: 'jess@example.com',
      job: 'Water coming through the ceiling under the bathroom after showers. Stain is getting bigger.',
      service: 'repairs-and-maintenance', suburb: 'Blacktown', urgency: 'this-week', bestTime: 'After 5pm', propertyType: 'house',
      photos: [], outOfArea: false, history: [], source: 'home',
    },
    {
      id: 'L-SAMPLE2', createdAt: hoursAgo(3), status: 'new', name: 'Mark Ellis', phone: '0491570111',
      job: 'Tree branch came down on the carport roof in the storm last night. Sheeting is split and gutter hanging.',
      service: 'repairs-and-maintenance', suburb: 'Seven Hills', urgency: 'emergency', propertyType: 'house',
      photos: [], outOfArea: false, history: [], source: 'quote-page',
    },
    {
      id: 'L-SAMPLE3', createdAt: hoursAgo(26), status: 'contacted', name: 'Aisha Rahman', phone: '0491570112', email: 'aisha@example.com',
      job: 'Looking at a rear extension for a family room, about 30 m², and opening up the kitchen.',
      service: 'extensions-and-builds', suburb: 'Castle Hill', urgency: 'planning', bestTime: 'Morning', propertyType: 'house',
      photos: [], outOfArea: false, source: 'area:castle-hill',
      history: [{ at: hoursAgo(24), type: 'status', value: 'contacted' }, { at: hoursAgo(24), type: 'note', value: 'Called — wants a ballpark before engaging a designer.' }],
    },
    {
      id: 'L-SAMPLE4', createdAt: hoursAgo(72), status: 'site-visit', name: 'Tom Barker', phone: '0491570113',
      job: 'Built-in wardrobes for two bedrooms, floor to ceiling, sliding doors.',
      service: 'carpentry-and-joinery', suburb: 'Kellyville', urgency: 'flexible', propertyType: 'townhouse',
      photos: [], outOfArea: false, source: 'service:carpentry-and-joinery',
      history: [{ at: hoursAgo(70), type: 'status', value: 'contacted' }, { at: hoursAgo(69), type: 'status', value: 'site-visit' }, { at: hoursAgo(69), type: 'note', value: 'Measure-up Thursday 8am.' }],
    },
    {
      id: 'L-SAMPLE5', createdAt: hoursAgo(140), status: 'quoted', name: 'Sophie Grant', phone: '0491570114', email: 'sophie@example.com',
      job: 'Full bathroom renovation, 1980s, want a walk-in shower and wall-hung vanity.',
      service: 'kitchen-and-bathroom-renovations', suburb: 'Liverpool', urgency: 'flexible', propertyType: 'house',
      photos: [], outOfArea: true, source: 'home',
      history: [{ at: hoursAgo(130), type: 'status', value: 'quoted' }, { at: hoursAgo(130), type: 'note', value: 'Quoted $31,400 incl. GST. Follow up next week.' }],
    },
    {
      id: 'L-SAMPLE6', createdAt: hoursAgo(300), status: 'won', name: 'Peter Collins', phone: '0491570115',
      job: 'Verandah boards rotten at the front, a couple of posts too.',
      service: 'repairs-and-maintenance', suburb: 'Parramatta', urgency: 'this-week', propertyType: 'house',
      photos: [], outOfArea: false, source: 'home',
      history: [{ at: hoursAgo(290), type: 'status', value: 'won' }],
    },
  ];
}
