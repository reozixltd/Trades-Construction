/**
 * Every photo the site uses, by slot. To fill a slot, save an image as
 * src/assets/photos/<slot>.jpg (or .jpeg/.png/.webp/.avif). It is picked up
 * automatically, optimised to AVIF/WebP and cropped to the slot's ratio.
 * Missing files fall back to a labelled placeholder, so the build never breaks.
 *
 * `alt` describes the photo for screen readers. `brief` and `search` are the
 * shot list used to source photos (docs/photo-brief.md is generated from this).
 */
export interface PhotoSlot {
  alt: string;
  /** What the photo must show. */
  brief: string;
  /** Suggested stock-library search terms. */
  search: string;
  orientation: 'landscape' | 'portrait' | 'square';
}

export const photoSlots = {
  hero: {
    alt: 'Builder fitting timber framing on a residential extension',
    brief: 'A tradesperson working on a house: framing, carpentry or a renovation in progress. Natural light, Australian-style brick or weatherboard home if possible. Faces optional.',
    search: 'carpenter framing house, builder construction site residential',
    orientation: 'portrait',
  },
  'about-owner': {
    alt: 'Owner of the business on site holding plans',
    brief: 'A builder or carpenter on site, half-length, looking approachable (work gear, not a suit).',
    search: 'builder portrait construction site, carpenter portrait workshop',
    orientation: 'portrait',
  },

  'service-extensions-and-builds': {
    alt: 'House extension under construction with new timber frame',
    brief: 'Home extension or new build in progress: frame, roof trusses or a near-finished rear addition.',
    search: 'house extension construction, timber frame house',
    orientation: 'landscape',
  },
  'service-carpentry-and-joinery': {
    alt: 'Carpenter measuring timber in a workshop',
    brief: 'Carpentry or joinery close-up: measuring, cutting, built-in cabinetry or a timber staircase.',
    search: 'carpenter workshop timber, custom joinery cabinetry',
    orientation: 'landscape',
  },
  'service-kitchen-and-bathroom-renovations': {
    alt: 'Newly renovated bathroom with walk-in shower and wall-hung vanity',
    brief: 'A finished modern bathroom or kitchen, light and clean (no visible brand logos).',
    search: 'modern bathroom renovation, renovated kitchen island',
    orientation: 'landscape',
  },
  'service-repairs-and-maintenance': {
    alt: 'Tradesperson repairing a timber deck with a drill',
    brief: 'Hands-on repair: fixing decking, a door, guttering or a leak. Tools visible.',
    search: 'handyman repair drill, roof gutter repair, deck repair',
    orientation: 'landscape',
  },

  'project-hills-alfresco-extension': {
    alt: 'Rear alfresco extension with raked timber ceiling and stacker doors',
    brief: 'Covered outdoor living area or alfresco with timber ceiling.',
    search: 'alfresco patio timber ceiling, covered outdoor living',
    orientation: 'landscape',
  },
  'project-blacktown-family-bathroom': {
    alt: 'Renovated family bathroom with walk-in shower',
    brief: 'Finished family bathroom: walk-in shower, tiles, vanity.',
    search: 'bathroom walk in shower renovation',
    orientation: 'landscape',
  },
  'project-parramatta-federation-repairs': {
    alt: 'Restored timber verandah on a federation-style home',
    brief: 'Timber verandah or porch on an older house, ideally freshly repaired or painted.',
    search: 'timber verandah old house, porch restoration',
    orientation: 'landscape',
  },
  'project-castle-hill-library-wall': {
    alt: 'Floor-to-ceiling built-in bookshelves in a study',
    brief: 'Built-in shelving or library wall joinery.',
    search: 'built in bookshelves study, library wall joinery',
    orientation: 'landscape',
  },
  'project-penrith-kitchen-renovation': {
    alt: 'Open-plan kitchen with stone island bench after renovation',
    brief: 'AFTER shot: open-plan kitchen with an island bench.',
    search: 'open plan kitchen island renovation',
    orientation: 'landscape',
  },
  'project-penrith-kitchen-renovation-before': {
    alt: 'Dated closed-in kitchen before the renovation',
    brief: 'BEFORE shot: an old or dated kitchen, or one mid-demolition. Should frame similarly to the after shot.',
    search: 'old kitchen before renovation, kitchen demolition',
    orientation: 'landscape',
  },
  'project-seven-hills-storm-make-safe': {
    alt: 'Damaged roof sheeting being repaired after a storm',
    brief: 'Roof or carport repair, storm damage, tarp or new sheeting.',
    search: 'roof repair storm damage, metal roof sheeting repair',
    orientation: 'landscape',
  },

  'area-parramatta': {
    alt: 'Street of older homes in Parramatta',
    brief: 'Suburban street or homes typical of Parramatta (federation/fibro mix). Real Parramatta preferred.',
    search: 'Parramatta houses, Sydney suburb street',
    orientation: 'landscape',
  },
  'area-penrith': {
    alt: 'Suburban homes in Penrith',
    brief: 'Western Sydney suburban homes; Penrith or the Nepean area preferred.',
    search: 'Penrith NSW houses, western Sydney suburb',
    orientation: 'landscape',
  },
  'area-blacktown': {
    alt: 'Brick homes on a street in Blacktown',
    brief: 'Brick-veneer suburban homes typical of Blacktown.',
    search: 'Blacktown houses, Sydney brick house street',
    orientation: 'landscape',
  },
  'area-castle-hill': {
    alt: 'Family homes in the Hills District',
    brief: 'Larger family homes, Hills District or similar leafy suburb.',
    search: 'Castle Hill Sydney houses, Hills District homes',
    orientation: 'landscape',
  },
} satisfies Record<string, PhotoSlot>;

export type PhotoSlotName = keyof typeof photoSlots;
