/**
 * Business configuration — the ONE file to edit per client.
 *
 * Every business fact shown on the site (name, licences, phone numbers,
 * hours, service areas, stats) comes from here, so the header, footer,
 * trust strip, schema and quote form can never disagree.
 *
 * Demo values: phone numbers use ACMA's reserved fictional ranges
 * (02 5550 xxxx, 0491 570 xxx). Licence and ABN numbers are deliberately fake.
 */

export type ThemeName = 'craft' | 'precision';

export interface Licence {
  /** What the licence covers, as printed by the regulator, e.g. "Contractor licence — general building work". */
  label: string;
  number: string;
  /** Regulator short name. Never show regulator logos (QBCC prohibits it). */
  issuer: string;
}

export interface ServiceArea {
  suburb: string;
  postcode: string;
  /** Slug of the matching area page in src/content/areas, if one exists. */
  page?: string;
  /** Approximate centre, used to draw the service-area map. */
  lat?: number;
  lng?: number;
}

export interface Stat {
  value: string;
  label: string;
  note: string;
}

export interface OpeningHours {
  days: string;
  hours: string;
  /** schema.org day codes, used for JSON-LD. */
  schemaDays: string[];
  opens: string;
  closes: string;
}

const FOUNDED = 2009;

export const business = {
  /** Shows the "sample business" ribbon and labels stats/reviews as sample. Set false for a real client. */
  demoMode: true as boolean,
  theme: 'craft' as ThemeName,

  tradingName: 'Form & Trade',
  /** Licensed (legal) name. Must always appear with the trading name. */
  legalName: 'Form & Trade Building Co. Pty Ltd',
  tagline: 'Build · Craft · Repair · Renovate',
  abn: '00 000 000 000',
  yearFounded: FOUNDED,
  /** State the licences are issued in (used in copy and schema). */
  state: 'NSW',
  /** Where the yard/workshop is, used in "based in…" copy. */
  baseSuburb: 'Seven Hills',

  licences: [
    { label: 'Contractor licence — general building work', number: '000000C', issuer: 'NSW Fair Trading' },
    { label: 'Contractor licence — plumbing & drainage', number: '000001C', issuer: 'NSW Fair Trading' },
  ] satisfies Licence[],

  insurance: 'Public liability $20M · Home Building Compensation Fund cover on eligible jobs',
  /** Short form for the trust strip. */
  insuranceShort: '$20M public liability',
  /** Workshop location: the map's home marker. */
  base: { lat: -33.774, lng: 150.936 },
  /** Shown in the hero kicker. Avoid absolute promises (ACL). */
  kicker: 'Licensed in NSW · Written quotes',

  headline: {
    trade: 'Builders, carpenters & repair trades',
    area: 'Western Sydney & the Hills',
  },
  intro:
    'Extensions, kitchens and bathrooms, custom joinery and fast repairs — quoted in writing, built by licensed trades, with a written schedule agreed up front.',

  contact: {
    phone: '02 5550 4821',
    afterHoursPhone: '0491 570 156',
    email: 'hello@formandtrade.example',
    /** Where the yard is. Leave address empty to hide the map/address. */
    address: 'Unit 4, 12 Example Street, Seven Hills NSW 2147',
  },

  hours: [
    { days: 'Mon–Fri', hours: '7:00am – 5:00pm', schemaDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '07:00', closes: '17:00' },
    { days: 'Saturday', hours: '8:00am – 12:00pm', schemaDays: ['Saturday'], opens: '08:00', closes: '12:00' },
  ] satisfies OpeningHours[],

  emergency: {
    headline: '24/7 emergency make-safe',
    examples: 'burst pipes, storm damage, roof leaks',
  },

  /** Defaults; the owner can override both from the console. */
  defaults: {
    emergencyEnabled: true,
    callbackPromise: 'We call back within 2 business hours.',
  },

  areas: {
    covered: [
      { suburb: 'Parramatta', postcode: '2150', page: 'parramatta', lat: -33.815, lng: 151.003 },
      { suburb: 'Penrith', postcode: '2750', page: 'penrith', lat: -33.751, lng: 150.694 },
      { suburb: 'Blacktown', postcode: '2148', page: 'blacktown', lat: -33.771, lng: 150.906 },
      { suburb: 'Castle Hill', postcode: '2154', page: 'castle-hill', lat: -33.731, lng: 151.004 },
      { suburb: 'Seven Hills', postcode: '2147', lat: -33.774, lng: 150.936 },
      { suburb: 'Baulkham Hills', postcode: '2153', lat: -33.758, lng: 150.993 },
      { suburb: 'Kellyville', postcode: '2155', lat: -33.705, lng: 150.955 },
      { suburb: 'Rouse Hill', postcode: '2155', lat: -33.682, lng: 150.915 },
      { suburb: 'Westmead', postcode: '2145', lat: -33.807, lng: 150.988 },
      { suburb: 'St Marys', postcode: '2760', lat: -33.762, lng: 150.774 },
      { suburb: 'Emu Plains', postcode: '2750', lat: -33.75, lng: 150.672 },
      { suburb: 'Quakers Hill', postcode: '2763', lat: -33.734, lng: 150.886 },
    ] satisfies ServiceArea[],
    /** Suburbs we sometimes take on — the checker says "ask us". */
    nearby: [
      { suburb: 'Liverpool', postcode: '2170', lat: -33.92, lng: 150.923 },
      { suburb: 'Richmond', postcode: '2753', lat: -33.6, lng: 150.752 },
      { suburb: 'Katoomba', postcode: '2780', lat: -33.715, lng: 150.312 },
      { suburb: 'Hornsby', postcode: '2077', lat: -33.703, lng: 151.099 },
    ] satisfies ServiceArea[],
  },

  stats: [
    { value: `${new Date().getFullYear() - FOUNDED}+`, label: 'Years in trade', note: `Family-run since ${FOUNDED}` },
    { value: '1,200+', label: 'Jobs completed', note: 'Repairs to full builds' },
    { value: '4.9', label: 'Google rating', note: 'From 180+ reviews' },
    { value: '4 trades', label: 'One licensed team', note: 'Building, joinery, renovation, repair' },
  ] satisfies Stat[],

  social: {
    googleReviewsUrl: 'https://www.google.com/maps',
  },
} as const;

export type Business = typeof business;

/** Licence details formatted for display, e.g. "Lic. 000000C". */
export const licenceLine = business.licences.map((l) => `Lic. ${l.number}`).join(' · ');
