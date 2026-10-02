/**
 * Content collections. Schemas make the build fail on missing or malformed
 * content, so mistakes never reach the live site.
 */
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const faq = z.object({ q: z.string(), a: z.string() });

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    icon: z.enum(['build', 'joinery', 'renovate', 'repair']),
    eyebrow: z.string(),
    summary: z.string().max(220),
    includes: z.array(z.string()).min(2).max(6),
    /** Full "from" price incl. GST — NSW rules forbid partial prices. */
    priceFrom: z.number().int().positive(),
    priceUnit: z.string().default(''),
    priceNote: z.string(),
    typicalTime: z.string(),
    emergency: z.boolean().default(false),
    faqs: z.array(faq).min(2).max(4),
    seoTitle: z.string(),
    seoDescription: z.string().max(160),
  }),
});

const areas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/areas' }),
  schema: z.object({
    suburb: z.string(),
    postcode: z.string().regex(/^\d{4}$/),
    region: z.string(),
    travelTime: z.string(),
    nearbySuburbs: z.array(z.string()),
    seoDescription: z.string().max(160),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    service: z.string(),
    suburb: z.string(),
    completed: z.string(),
    duration: z.string(),
    summary: z.string(),
    specs: z.array(z.object({ label: z.string(), value: z.string() })).max(3),
    featured: z.boolean().default(false),
    /** Optional detail for the home-page case study (before/after + quote vs final). */
    caseStudy: z
      .object({
        quoted: z.number().int().positive(),
        final: z.number().int().positive(),
        challenges: z.array(z.object({ title: z.string(), text: z.string() })).max(3),
        /** Explains any difference between quote and final invoice. */
        varianceNote: z.string(),
        beforeTone: z.enum(['timber', 'stone', 'slate', 'clay']).default('stone'),
      })
      .optional(),
    /** Placeholder tone for demo artwork; real photos replace it. */
    tone: z.enum(['timber', 'stone', 'slate', 'clay']).default('slate'),
  }),
});

const reviews = defineCollection({
  loader: file('./src/content/reviews.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    suburb: z.string(),
    rating: z.number().min(1).max(5),
    service: z.string(),
    text: z.string(),
    date: z.string(),
  }),
});

const faqs = defineCollection({
  loader: file('./src/content/faqs.json'),
  schema: faq.extend({ id: z.string() }),
});

export const collections = { services, areas, projects, reviews, faqs };
