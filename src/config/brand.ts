export interface BrandConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  socialImagePath: string;
  themeColor: string;
  supportEmail: string;
  institutionDisclaimer: string;
  establishedYear: number;
}

export const brand: BrandConfig = {
  name: 'Folio',
  shortName: 'Folio',
  tagline: 'Curated university academic archives & examination repository',
  description: 'An open, high-fidelity academic archive of lecture notes, mid-semester tests, end-semester examinations, lab manuals, and viva preparation.',
  socialImagePath: '/src/assets/images/og_folio_preview_1793015468447.jpg',
  themeColor: '#183B32',
  supportEmail: 'academic@folio.internal',
  institutionDisclaimer: 'Folio is an independent academic resource repository curated for student scholarship.',
  establishedYear: 2026,
};
