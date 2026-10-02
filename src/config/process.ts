/** The three-step "How it works" funnel shown after the services. Edit per client. */
export interface ProcessStep {
  title: string;
  text: string;
  cta?: { label: string; href: string };
}

export const processSteps: ProcessStep[] = [
  {
    title: 'Send three details and a photo',
    text: 'Name, number and what needs doing. Photos are optional, but they let us price many jobs without a visit.',
    cta: { label: 'Start a request', href: '/quote/' },
  },
  {
    title: 'Get a price range or a site visit',
    text: 'We call back with a price range from your photos, or book a time to measure up. Repairs get a call-out price up front.',
  },
  {
    title: 'Approve a written quote',
    text: 'Itemised and including GST. Work starts on a date we agree, and any change is quoted in writing before it happens.',
  },
];
