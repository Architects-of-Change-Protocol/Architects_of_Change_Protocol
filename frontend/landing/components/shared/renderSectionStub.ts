import { LandingSectionContent } from '../../lib/types';

export function renderSectionStub(content: LandingSectionContent): string {
  return [
    `<section data-landing-section="${content.key}">`,
    `  <h2>${content.title}</h2>`,
    `  <p>${content.description}</p>`,
    `</section>`,
  ].join('\n');
}
