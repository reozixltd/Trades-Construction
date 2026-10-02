/**
 * "How we price" models shown in the Pricing section. Edit per client.
 * Keep wording factual: full prices incl. GST, no absolute promises (ACL).
 */
export interface PricingModel {
  name: string;
  /** Either fixed text, or a service id whose "from" price is shown. */
  price: { text: string } | { fromService: string };
  note: string;
  points: string[];
  cta: { label: string; href: string };
  featured?: boolean;
}

export const pricingIntro = {
  title: 'Written prices before work starts',
  lead: 'Three ways we price, depending on the job. Every price includes GST.',
};

export const pricingModels: PricingModel[] = [
  {
    name: 'Repairs & call-outs',
    price: { fromService: 'repairs-and-maintenance' },
    note: 'Call-out covers the first 30 minutes on site.',
    points: ['Price range from your photos before we visit', 'Exact price agreed on site before work starts', 'Photos of the finished repair'],
    cta: { label: 'Book a repair', href: '/quote/?service=repairs-and-maintenance' },
  },
  {
    name: 'Renovations & joinery',
    price: { text: 'Fixed written quote' },
    note: 'Itemised, so you can see labour, materials and allowances line by line.',
    points: ['Free measure and quote', 'Variations only with your written approval', 'Progress payments at agreed stages'],
    cta: { label: 'Request a quote', href: '/quote/' },
    featured: true,
  },
  {
    name: 'Extensions & builds',
    price: { text: 'Fixed-price contract' },
    note: 'Written NSW home building contract with a schedule of works and insurance in place before any deposit.',
    points: ['Ballpark within a week of the site visit', 'Deposit capped at 10% (NSW law)', 'One supervisor from approval to handover'],
    cta: { label: 'Talk about a build', href: '/quote/?service=extensions-and-builds' },
  },
];
