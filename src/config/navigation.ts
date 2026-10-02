export interface NavLink {
  label: string;
  href: string;
}

export const primaryNav: NavLink[] = [
  { label: 'Services', href: '/services/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Areas', href: '/areas/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

export const legalNav: NavLink[] = [
  { label: 'Privacy policy', href: '/privacy/' },
  { label: 'Terms', href: '/terms/' },
  { label: 'Owner console', href: '/console/' },
];
