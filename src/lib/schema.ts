/** schema.org JSON-LD for the business, built from config. */
import type { Business } from '@/config/business';

interface RatingLike {
  rating: number;
}

type SchemaInput = Pick<Business, 'demoMode' | 'tradingName' | 'legalName' | 'abn' | 'contact' | 'hours' | 'areas' | 'state'> & {
  intro?: string;
};

export function buildBusinessSchema(b: SchemaInput, reviews: readonly RatingLike[], url?: string) {
  const schema: Record<string, unknown> & { areaServed: unknown[]; aggregateRating?: unknown } = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: b.tradingName,
    legalName: b.legalName,
    taxID: b.abn,
    url,
    telephone: b.contact.phone,
    email: b.contact.email,
    description: b.intro,
    address: b.contact.address
      ? { '@type': 'PostalAddress', streetAddress: b.contact.address, addressRegion: b.state, addressCountry: 'AU' }
      : undefined,
    areaServed: b.areas.covered.map((a) => ({ '@type': 'Place', name: `${a.suburb} ${b.state} ${a.postcode}` })),
    openingHoursSpecification: b.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.schemaDays,
      opens: h.opens,
      closes: h.closes,
    })),
  };

  // Never publish a rating built from sample reviews (ACL + Google guidelines).
  if (!b.demoMode && reviews.length) {
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    schema.aggregateRating = { '@type': 'AggregateRating', ratingValue: avg.toFixed(1), reviewCount: reviews.length };
  }
  return schema;
}

/** JSON for <script type="application/ld+json">, with "<" escaped so content can never close the tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
