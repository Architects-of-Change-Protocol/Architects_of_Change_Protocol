import type { ReactNode } from 'react';
import { LogoRotating } from '../components/logo/LogoRotating';
import { CONSTITUTIONAL_INDEX_ORGANIZATIONS } from './assuranceIndexData';
import './assurance.css';

const CONTACT_MAILTO = 'mailto:vicvalch@onchainfest.xyz';
const FOUNDER_ESSAY_URL = 'https://www.linkedin.com/pulse/i-started-looking-sovereignty-found-constitutional-valverde-checa-hnpye/';

type Section = { title: string; body?: string[]; bullets?: string[] };

function SupportLayout({ title, subtitle, updated, children }: { title: string; subtitle: string; updated: string; children: ReactNode }) {
  return (
    <main className="assurance-support-page min-h-screen bg-[#070d0b] text-white font-sans">
      <nav className="assurance-support-nav" aria-label="Support page navigation">
        <a href="/?view=assurance" className="assurance-support-brand" aria-label="Back to AOC Assurance">
          <LogoRotating size={28} inverted />
          <span>AOC Assurance</span>
        </a>
        <a href="/?view=assurance" className="assurance-support-back">← Back to Assurance</a>
      </nav>
      <article className="assurance-support-shell">
        <header className="assurance-support-header">
          <p className="assurance-support-eyebrow">{updated}</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>
        {children}
      </article>
    </main>
  );
}

function TextSections({ sections }: { sections: Section[] }) {
  return (
    <div className="assurance-support-content">
      {sections.map((section, index) => (
        <section key={section.title} className="assurance-support-section" aria-labelledby={`support-section-${index}`}>
          <h2 id={`support-section-${index}`}>{index + 1}. {section.title}</h2>
          {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
        </section>
      ))}
    </div>
  );
}

function ContactCta({ secondary }: { secondary?: React.ReactNode }) {
  return <div className="assurance-support-actions"><a className="assurance-support-primary" href={CONTACT_MAILTO}>Contact Us</a>{secondary}</div>;
}

const privacySections: Section[] = [
  { title: 'Overview', body: ['AOC Assurance is a constitutional assessment framework developed by AOC Protocol. This Privacy Policy explains how information may be collected, used, and protected when users interact with AOC Assurance pages, assessment offerings, forms, communications, and related services.'] },
  { title: 'Information We Collect', body: ['We may collect information that users voluntarily submit, including name, organization, role, email address, assessment requests, submitted evidence, comments, and communications.', 'We may also collect limited technical information such as browser type, device information, page interactions, referral source, and general usage analytics.'] },
  { title: 'Assessment Information', body: ['Assessment-related information may include publicly observable evidence, submitted documentation, website references, repository references, governance materials, policies, disclosures, and other materials relevant to evaluating governance and sovereignty characteristics.'] },
  { title: 'Payment Processing', body: ['Payments may be processed through third-party payment providers such as Stripe. AOC Assurance does not store full payment card details.'] },
  { title: 'Third-Party Services', body: ['AOC Assurance may use third-party services for forms, payments, analytics, hosting, communications, and external content. These services may process information according to their own privacy policies.'] },
  { title: 'How We Use Information', body: ['Information may be used to deliver assessments, communicate with users, improve methodology, respond to inquiries, process requests, maintain records, and improve AOC Assurance services.'] },
  { title: 'Data Retention', body: ['Information may be retained for as long as reasonably necessary to provide services, maintain assessment records, comply with legal obligations, resolve disputes, and improve the framework.'] },
  { title: 'Public Evidence', body: ['Public Constitutional Assessments may rely on publicly observable evidence. Publicly available information may be referenced in assessment outputs, index listings, or research materials.'] },
  { title: 'Confidential Materials', body: ['If non-public materials are submitted, AOC Assurance will treat them as assessment materials and will not intentionally publish confidential materials without permission, unless otherwise agreed.'] },
  { title: 'Contact', body: ['Questions about this Privacy Policy can be submitted through the Contact Us link.'] },
];

const termsSections: Section[] = [
  { title: 'Overview', body: ['AOC Assurance provides constitutional assessment, research, indexing, and advisory materials related to AI governance and sovereignty.'] },
  { title: 'Nature of Assessments', body: ['AOC Assurance assessments are analytical evaluations based on publicly observable evidence and/or submitted materials. They are intended to help organizations understand constitutional posture, identify limiting factors, and improve governance and sovereignty characteristics.'] },
  { title: 'No Certification', body: ['AOC Assurance does not certify organizations as safe, secure, compliant, trustworthy, or risk-free. Scores, findings, rankings, and reports are analytical opinions based on available evidence and should not be interpreted as guarantees, certifications, legal advice, compliance determinations, or endorsements.'] },
  { title: 'Evidence Limitations', body: ['Assessment outputs depend on the quality, availability, completeness, and accuracy of evidence. Public assessments may be limited by what is publicly observable.'] },
  { title: 'User Responsibilities', body: ['Users are responsible for ensuring that any materials they submit are accurate, authorized for sharing, and do not violate third-party rights or confidentiality obligations.'] },
  { title: 'Intellectual Property', body: ['AOC Assurance, AOC Protocol, the Constitutional Index, Constitutional Matrix, methodology, scoring model, reports, copy, designs, and related materials are owned by or licensed to OnchainFest LLC unless otherwise stated.'] },
  { title: 'Payments and Refunds', body: ['Paid assessments are purchased through third-party payment providers. Unless otherwise stated in writing, assessment fees are non-refundable once work has begun.'] },
  { title: 'Third-Party Links', body: ['AOC Assurance pages may link to external websites, services, repositories, articles, and payment providers. AOC Assurance is not responsible for third-party content, policies, or services.'] },
  { title: 'Limitation of Liability', body: ['To the maximum extent permitted by applicable law, OnchainFest LLC and related AOC initiatives are not liable for indirect, incidental, consequential, special, or punitive damages arising from use of AOC Assurance materials or services.'] },
  { title: 'Contact', body: ['Questions about these Terms can be submitted through the Contact Us link.'] },
];

export function PrivacyPage() { return <SupportLayout title="Privacy Policy" subtitle="How AOC Assurance handles information submitted through assessments, forms, communications, and related services." updated="Last updated: June 2026"><TextSections sections={privacySections} /><ContactCta /></SupportLayout>; }
export function TermsPage() { return <SupportLayout title="Terms of Service" subtitle="Terms governing access to AOC Assurance assessments, research, pages, and related services." updated="Last updated: June 2026"><TextSections sections={termsSections} /><ContactCta /></SupportLayout>; }

export function MethodologyPage() {
  const sections: Section[] = [
    { title: 'Purpose', body: ['The AOC Constitutional Index evaluates how AI organizations balance two independent dimensions: Governance and Sovereignty. The goal is not only to produce a score, but to understand where an organization sits, why it sits there, and what would need to change to improve its constitutional posture.'] },
    { title: 'Governance Dimension', body: ['Governance evaluates how an AI system, organization, or capability is supervised, controlled, made accountable, and aligned with responsible operating principles.'], bullets: ['Oversight', 'Accountability', 'Auditability', 'Transparency', 'Risk Management'] },
    { title: 'Sovereignty Dimension', body: ['Sovereignty evaluates who truly controls the capability, who can operate it independently, who can move or replace it, and how much dependency exists over time.'], bullets: ['Ownership', 'Portability', 'Runtime Control', 'Exit Feasibility', 'Authority'] },
    { title: 'Constitutional Matrix', body: ['The Constitutional Matrix positions organizations using Governance and Sovereignty as independent axes.'], bullets: ['High Governance / High Sovereignty: Constitutional Leaders', 'High Governance / Low Sovereignty: Trusted Custodians', 'Low Governance / High Sovereignty: Sovereignty Pioneers', 'Low Governance / Low Sovereignty: Dependency Platforms'] },
    { title: 'Scoring Philosophy', body: ['Scores are based on evidence, not claims alone. A higher score indicates stronger observable or submitted evidence for a given dimension. Scores may change as new evidence becomes available.'] },
    { title: 'Evidence Model', body: ['AOC Assurance may evaluate:'], bullets: ['Public websites', 'Documentation', 'Security pages', 'Trust centers', 'Repositories', 'Policies', 'Product architecture disclosures', 'Terms and privacy materials', 'Governance disclosures', 'Customer control and portability signals', 'Submitted evidence for paid assessments'] },
    { title: 'Public vs Submitted Evidence', body: ['Public Constitutional Assessments rely on publicly observable evidence. Founder and Enterprise assessments may include submitted materials, interviews, internal documentation, architecture details, or operational evidence.'] },
    { title: 'Interpretation', body: ['A strong Governance score does not guarantee Sovereignty. A strong Sovereignty score does not guarantee Governance. Constitutional position is determined by the relationship between both dimensions.'] },
    { title: 'Limitations', body: ['The Constitutional Index is not a certification, compliance opinion, security guarantee, or endorsement. It is an analytical framework designed to support understanding, comparison, and improvement.'] },
    { title: 'Roadmap Orientation', body: ['The deeper purpose of the methodology is to guide organizations toward a roadmap of change: stronger governance, stronger sovereignty, or both.'] },
  ];
  return <SupportLayout title="Constitutional Index Methodology" subtitle="How AOC Assurance evaluates Governance, Sovereignty, and Constitutional Position." updated="Methodology v1.0 — June 2026"><TextSections sections={sections} /><div className="assurance-support-actions"><a className="assurance-support-primary" href="/?view=assurance">Explore AOC Assurance</a><a className="assurance-support-secondary" href={CONTACT_MAILTO}>Contact Us</a></div></SupportLayout>;
}

export function ResearchPage() {
  return <SupportLayout title="Public Research Initiative" subtitle="Tracking how AI organizations balance Governance and Sovereignty over time." updated="Research status: Early and evolving"><div className="assurance-support-content"><section className="assurance-support-section"><p>AOC Assurance is building a public research initiative to evaluate the constitutional posture of AI organizations using publicly observable evidence.</p><p>The objective is to understand the structural trade-offs behind AI business models, deployment patterns, operating models, and control surfaces.</p></section><section className="assurance-support-section"><h2>Research Focus</h2><ul>{['Governance maturity','Sovereignty maturity','Dependency patterns','Portability and exit feasibility','Auditability and accountability','Constitutional trade-offs','Roadmaps toward stronger constitutional posture'].map((item)=><li key={item}>{item}</li>)}</ul></section><section className="assurance-support-section"><h2>Current Index Coverage</h2><div className="assurance-research-grid">{CONSTITUTIONAL_INDEX_ORGANIZATIONS.map((org)=><a key={org.id} href={`/assurance/index/${org.slug}`} className="assurance-research-card"><strong>{org.name}</strong><span>{org.quadrantLabel}</span></a>)}</div></section><section className="assurance-support-section"><h2>Research Status</h2><p>This initiative is early and evolving. Scores and findings may be updated as new evidence becomes available.</p></section></div><div className="assurance-support-actions"><a className="assurance-support-primary" href="/?view=assurance#index">Explore the Constitutional Index</a><a className="assurance-support-secondary" href={FOUNDER_ESSAY_URL} target="_blank" rel="noopener noreferrer">Read the Founder Essay ↗</a></div></SupportLayout>;
}

export function AboutPage() {
  return <SupportLayout title="About AOC Assurance" subtitle="A constitutional assessment framework for understanding AI Governance, Sovereignty, and the balance between them." updated="AOC Assurance"><div className="assurance-support-content"><section className="assurance-support-section"><p>AOC Assurance is a constitutional assessment framework developed by AOC Protocol.</p><p>It was created to help organizations understand where AI companies, platforms, and systems sit across two dimensions that are often discussed separately but rarely measured together: Governance and Sovereignty.</p><p>Governance shows how a system is supervised, controlled, audited, and made accountable.</p><p>Sovereignty shows who truly controls the capability, who can operate it, move it, replace it, and preserve independence over time.</p></section><section className="assurance-support-section"><h2>AOC Assurance exists to help organizations:</h2><ul>{['Measure constitutional posture','Understand limiting factors','Compare governance and sovereignty trade-offs','Build roadmaps toward stronger constitutional maturity','Avoid confusing trust with governance alone'].map((item)=><li key={item}>{item}</li>)}</ul></section><section className="assurance-support-section"><p><strong>AOC Assurance and AOC Protocol are initiatives of OnchainFest LLC.</strong></p></section></div><div className="assurance-support-actions"><a className="assurance-support-primary" href="/?view=assurance#index">Explore the Constitutional Index</a><a className="assurance-support-secondary" href={CONTACT_MAILTO}>Contact Us</a></div></SupportLayout>;
}
