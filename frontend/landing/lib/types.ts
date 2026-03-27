export type LandingSectionKey =
  | 'navbar'
  | 'hero'
  | 'socialProof'
  | 'problem'
  | 'solution'
  | 'useCases'
  | 'consentLayer'
  | 'cta'
  | 'footer';

export interface LandingSectionContent {
  key: LandingSectionKey;
  title: string;
  description: string;
}

export interface LandingContentMap {
  sections: Record<LandingSectionKey, LandingSectionContent>;
}
