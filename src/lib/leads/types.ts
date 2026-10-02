/** Lead domain types shared by the quote form, the repository and the console. */

export const URGENCIES = ['emergency', 'this-week', 'flexible', 'planning'] as const;
export type Urgency = (typeof URGENCIES)[number];

export const URGENCY_LABELS: Record<Urgency, string> = {
  emergency: 'Emergency',
  'this-week': 'This week',
  flexible: 'Flexible',
  planning: 'Just planning',
};

export const PROPERTY_TYPES = ['house', 'unit', 'townhouse', 'commercial'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const LEAD_STATUSES = ['new', 'contacted', 'site-visit', 'quoted', 'won', 'lost'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  'site-visit': 'Site visit booked',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
};

/** What the customer submits. Only name, phone and job are required. */
export interface LeadInput {
  name: string;
  phone: string;
  job: string;
  email?: string;
  service?: string;
  suburb?: string;
  urgency?: Urgency;
  bestTime?: string;
  propertyType?: PropertyType;
  /** Downscaled photos as data URLs (demo). Production stores file references. */
  photos?: string[];
  /** Photos the browser couldn't process (e.g. HEIC outside Safari) — the owner asks for them on the call. */
  photosNotAttached?: number;
  outOfArea?: boolean;
  source?: string;
}

export interface LeadEvent {
  at: string;
  type: 'status' | 'note';
  value: string;
}

export interface Lead extends Omit<LeadInput, 'photos' | 'outOfArea'> {
  id: string;
  createdAt: string;
  status: LeadStatus;
  photos: string[];
  outOfArea: boolean;
  history: LeadEvent[];
}
