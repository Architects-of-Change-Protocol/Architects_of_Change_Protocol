import { useEffect, useState } from 'react';
import { LogoRotating } from '../components/logo/LogoRotating';
import './assurance.css';

const PAGE_URL = 'https://www.aocprotocol.org/what-is-ai-sovereignty';

// ── Per-page metadata injection ───────────────────────────────────────────────

function usePageMeta() {
  useEffect(() => {
    const prevTitle = document.title;

    const setMeta = (name: string, content: string, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      const created = !el;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
      return created ? el : null;
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      const prevHref = el?.getAttribute('href') ?? null;
      const created = !el;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
      return { el, prevHref, created };
    };

    document.title = 'What is AI Sovereignty? | AOC Assurance';

    setMeta('description', 'AI Sovereignty is the ability of an organization to control, operate, move, replace, and preserve independence over its AI capabilities. Learn how AOC Assurance measures AI Sovereignty.');
    setMeta('keywords', 'AI Sovereignty, Sovereign AI, AI Sovereignty Framework, AI Sovereignty Assessment, AI Sovereignty Score, AI Independence, AI Vendor Lock-in, Constitutional AI, What is AI Sovereignty, AOC Assurance, AOC Constitutional Index');
    setMeta('robots', 'index, follow');

    const { el: canonicalEl, prevHref: prevCanonical } = setLink('canonical', PAGE_URL);

    setMeta('og:title', 'What is AI Sovereignty? | AOC Assurance', true);
    setMeta('og:description', 'AI Sovereignty measures how much control an organization truly has over its AI capabilities, infrastructure, data, continuity, and operational independence.', true);
    setMeta('og:url', PAGE_URL, true);
    setMeta('og:type', 'article', true);
    setMeta('og:image', 'https://www.aocprotocol.org/og-image.png', true);
    setMeta('og:site_name', 'AOC Assurance', true);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', 'What is AI Sovereignty? | AOC Assurance');
    setMeta('twitter:description', 'AI Sovereignty measures how much control an organization truly has over its AI capabilities, infrastructure, data, continuity, and operational independence.');
    setMeta('twitter:site', '@archofchange');

    const jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.id = 'ai-sovereignty-jsonld';
    jsonLd.text = JSON.stringify(buildJsonLd());
    document.head.appendChild(jsonLd);

    return () => {
      document.title = prevTitle;
      const injected = document.getElementById('ai-sovereignty-jsonld');
      if (injected) injected.remove();
      if (prevCanonical !== null) canonicalEl?.setAttribute('href', prevCanonical);
    };
  }, []);
}

function buildJsonLd() {
  const faqs = [
    {
      q: 'What is AI Sovereignty?',
      a: 'AI Sovereignty is the ability of an organization to own, control, operate, move, replace, and preserve independence over the AI capabilities that power its business. It answers: who truly controls this AI capability?',
    },
    {
      q: 'Why does AI Sovereignty matter?',
      a: 'AI Sovereignty matters because organizations increasingly depend on AI providers for models, infrastructure, workflows, and decision support. When sovereignty is weak, organizations become vulnerable to vendor lock-in, service discontinuation, model deprecation, pricing changes, and reduced operational autonomy.',
    },
    {
      q: 'What is a Sovereignty Score?',
      a: 'A Sovereignty Score is a quantitative measure produced by the AOC Constitutional Index that evaluates how much control an organization has over its AI capabilities across dimensions including infrastructure control, data portability, model optionality, continuity, and operational independence.',
    },
    {
      q: 'Can an organization have strong governance but weak sovereignty?',
      a: 'Yes. This is the Trusted Custodian position in the AOC Constitutional Matrix. An organization can have strong oversight policies while still depending entirely on a provider for model access, infrastructure, and system continuity. That dependency creates risk that governance alone cannot address.',
    },
    {
      q: 'How is AI Sovereignty measured?',
      a: 'AOC Assurance evaluates AI Sovereignty using publicly observable evidence and assessment criteria across infrastructure control, portability, continuity, provider dependency, model flexibility, and operational independence — producing a Sovereignty Score and constitutional position.',
    },
    {
      q: 'What creates vendor lock-in in AI systems?',
      a: 'Vendor lock-in in AI systems arises from closed ecosystems, non-exportable data, single-provider model dependency, proprietary workflow integrations, limited self-hosting options, and the absence of migration paths — all of which reduce an organization\'s operational sovereignty.',
    },
    {
      q: 'What is the relationship between AI Sovereignty and AI Trust?',
      a: 'AI Trust emerges when both governance and sovereignty are in balance. An organization may be well-governed but constitutionally dependent. Sovereignty without governance creates chaos. Trust requires both: proper oversight and genuine control.',
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.aocprotocol.org/#organization',
        name: 'AOC Assurance',
        alternateName: 'AOC Protocol',
        url: 'https://www.aocprotocol.org/',
        logo: { '@type': 'ImageObject', url: 'https://www.aocprotocol.org/og-image.png' },
        founder: { '@type': 'Person', name: 'Victor Valverde', sameAs: 'https://www.linkedin.com/in/victorvalverde/' },
        sameAs: [
          'https://www.linkedin.com/company/architects-of-change-protocol/',
          'https://x.com/archofchange',
          'https://github.com/Architects-of-Change-Protocol/Architects_of_Change_Protocol',
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: 'What is AI Sovereignty? | AOC Assurance',
        description: 'AI Sovereignty is the ability of an organization to control, operate, move, replace, and preserve independence over its AI capabilities. Learn how AOC Assurance measures AI Sovereignty.',
        isPartOf: { '@id': 'https://www.aocprotocol.org/#website' },
        about: { '@id': 'https://www.aocprotocol.org/#organization' },
        primaryImageOfPage: { '@type': 'ImageObject', url: 'https://www.aocprotocol.org/og-image.png' },
        keywords: ['AI Sovereignty', 'Sovereign AI', 'AI Sovereignty Framework', 'AI Sovereignty Assessment', 'AI Sovereignty Score', 'AI Independence', 'AI Vendor Lock-in', 'Constitutional AI'],
        inLanguage: 'en-US',
        publisher: { '@id': 'https://www.aocprotocol.org/#organization' },
      },
      {
        '@type': 'Article',
        '@id': `${PAGE_URL}#article`,
        headline: 'What is AI Sovereignty?',
        description: 'AI Sovereignty measures how much control an organization truly has over its AI capabilities, infrastructure, data, continuity, and operational independence.',
        url: PAGE_URL,
        image: 'https://www.aocprotocol.org/og-image.png',
        author: { '@type': 'Person', name: 'Victor Valverde', sameAs: 'https://www.linkedin.com/in/victorvalverde/' },
        publisher: { '@id': 'https://www.aocprotocol.org/#organization' },
        inLanguage: 'en-US',
        isPartOf: { '@id': `${PAGE_URL}#webpage` },
        about: [
          { '@type': 'Thing', name: 'AI Sovereignty' },
          { '@type': 'Thing', name: 'AI Governance' },
          { '@type': 'Thing', name: 'AOC Constitutional Index' },
          { '@type': 'Thing', name: 'Vendor Lock-in' },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${PAGE_URL}#faqpage`,
        mainEntity: faqs.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.aocprotocol.org/' },
          { '@type': 'ListItem', position: 2, name: 'AOC Assurance', item: 'https://www.aocprotocol.org/?view=assurance' },
          { '@type': 'ListItem', position: 3, name: 'What is AI Sovereignty?', item: PAGE_URL },
        ],
      },
      {
        '@type': 'Service',
        '@id': 'https://www.aocprotocol.org/#sovereignty-service',
        name: 'AI Sovereignty Assessment',
        serviceType: 'AI Sovereignty Assessment',
        description: 'A constitutional assessment framework that evaluates AI systems across Governance and Sovereignty dimensions, producing a Sovereignty Score and constitutional position.',
        provider: { '@id': 'https://www.aocprotocol.org/#organization' },
        url: 'https://www.aocprotocol.org/?view=assurance',
      },
    ],
  };
}

// ── Sovereignty dimensions grid ───────────────────────────────────────────────

const DIMENSIONS = [
  {
    title: 'Infrastructure Control',
    description: 'Can the organization control where and how AI systems run?',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <rect x="2" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 9h10M6 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Data Control',
    description: 'Can data be exported, retained, protected, and moved independently?',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <ellipse cx="11" cy="7" rx="7" ry="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 7v4c0 1.657 3.134 3 7 3s7-1.343 7-3V7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 11v4c0 1.657 3.134 3 7 3s7-1.343 7-3v-4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Model Optionality',
    description: 'Can AI providers be replaced without major business disruption?',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="5" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7.5 11h7M13.5 8.5L16 11l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Portability',
    description: 'Can workflows and capabilities move across environments?',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <rect x="2" y="6" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="6" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 11h2M11 9l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Continuity',
    description: 'Can operations continue if a provider changes terms or becomes unavailable?',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M11 3v4M11 15v4M3 11h4M15 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: 'Operational Independence',
    description: 'How dependent is the organization on external parties for critical AI functionality?',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M11 3C6.582 3 3 6.582 3 11s3.582 8 8 8 8-3.582 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 3l4 4-4 4M19 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function DimensionsGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Key dimensions of AI Sovereignty">
      {DIMENSIONS.map((d) => (
        <div
          key={d.title}
          role="listitem"
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 hover:bg-white/[0.035] transition-colors"
        >
          <div className="mb-4 text-cyan-300">{d.icon}</div>
          <h3 className="text-sm font-semibold text-white/90 mb-2">{d.title}</h3>
          <p className="text-sm text-white/55 leading-relaxed">{d.description}</p>
        </div>
      ))}
    </div>
  );
}

// ── High vs Low sovereignty comparison ───────────────────────────────────────

const HIGH_SOV = [
  'Open architectures',
  'Exportable data',
  'Model optionality',
  'Self-hosting options',
  'Provider independence',
  'Strong continuity planning',
];

const LOW_SOV = [
  'Closed ecosystems',
  'Non-exportable data',
  'Single-provider dependence',
  'No migration path',
  'Limited operational control',
  'High lock-in risk',
];

function SovereigntyComparison() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 mb-5">High Sovereignty</p>
        <ul className="space-y-3" aria-label="Characteristics of high AI sovereignty">
          {HIGH_SOV.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-white/70">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-red-800/25 bg-red-950/[0.06] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400 mb-5">Low Sovereignty</p>
        <ul className="space-y-3" aria-label="Characteristics of low AI sovereignty">
          {LOW_SOV.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-white/70">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── FAQ section ───────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'What is AI Sovereignty?',
    a: 'AI Sovereignty is the ability of an organization to own, control, operate, move, replace, and preserve independence over the AI capabilities that power its business. It answers: who truly controls this AI capability?',
  },
  {
    q: 'Why does AI Sovereignty matter?',
    a: 'AI Sovereignty matters because organizations increasingly depend on AI providers for models, infrastructure, workflows, and decision support. When sovereignty is weak, organizations become vulnerable to vendor lock-in, service discontinuation, model deprecation, pricing changes, and reduced operational autonomy.',
  },
  {
    q: 'What is a Sovereignty Score?',
    a: 'A Sovereignty Score is a quantitative measure produced by the AOC Constitutional Index that evaluates how much control an organization has over its AI capabilities across dimensions including infrastructure control, data portability, model optionality, continuity, and operational independence.',
  },
  {
    q: 'Can an organization have strong governance but weak sovereignty?',
    a: 'Yes. This is the Trusted Custodian position in the AOC Constitutional Matrix. An organization can have strong oversight policies while still depending entirely on a provider for model access, infrastructure, and system continuity. That dependency creates risk that governance alone cannot address.',
  },
  {
    q: 'How is AI Sovereignty measured?',
    a: 'AOC Assurance evaluates AI Sovereignty using publicly observable evidence and assessment criteria across infrastructure control, portability, continuity, provider dependency, model flexibility, and operational independence — producing a Sovereignty Score and constitutional position.',
  },
  {
    q: 'What creates vendor lock-in in AI systems?',
    a: "Vendor lock-in in AI systems arises from closed ecosystems, non-exportable data, single-provider model dependency, proprietary workflow integrations, limited self-hosting options, and the absence of migration paths — all of which reduce an organization's operational sovereignty.",
  },
  {
    q: 'What is the relationship between AI Sovereignty and AI Trust?',
    a: 'AI Trust emerges when both governance and sovereignty are in balance. An organization may be well-governed but constitutionally dependent. Sovereignty without governance creates chaos. Trust requires both: proper oversight and genuine control.',
  },
];

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/[0.07]">
      <button
        type="button"
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-medium text-white/85 group-hover:text-white transition-colors leading-snug">{q}</span>
        <span
          className={`mt-0.5 shrink-0 text-white/40 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {open && <p className="pb-5 text-sm text-white/55 leading-relaxed">{a}</p>}
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function SovereigntyNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-30 backdrop-blur bg-[#070d0b]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
        <a href="/?view=assurance" className="flex items-center gap-3">
          <LogoRotating size={28} inverted />
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold tracking-tighter">AOC</span>
            <span className="text-xs text-emerald-400 uppercase tracking-[0.2em]">Assurance</span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-white/70">
          <a href="/?view=assurance#map" className="hover:text-white transition-colors">Constitutional Matrix</a>
          <a href="/?view=assurance#index" className="hover:text-white transition-colors">Index</a>
          <a href="/assurance/methodology" className="hover:text-white transition-colors">Methodology</a>
          <a href="/" className="hover:text-white transition-colors">Protocol</a>
        </div>

        <a
          href="/?view=assurance#assessments"
          className="hidden md:inline-block px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-xl transition-colors"
        >
          Request Assessment
        </a>

        <button
          type="button"
          className="relative flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white transition-colors hover:border-white/30 hover:bg-white/5"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${menuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
          <span className={`absolute h-0.5 w-5 bg-current transition-opacity duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
          <span className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${menuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
        </button>
      </div>

      <div
        aria-hidden={!menuOpen}
        className={`absolute left-0 right-0 top-full overflow-hidden border-b border-white/10 bg-[#070d0b]/95 backdrop-blur-lg transition-[max-height,opacity] duration-300 ease-out md:hidden ${menuOpen ? 'max-h-72 opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-1">
          {[
            { label: 'Constitutional Matrix', href: '/?view=assurance#map' },
            { label: 'Index', href: '/?view=assurance#index' },
            { label: 'Methodology', href: '/assurance/methodology' },
            { label: 'AOC Protocol', href: '/' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ── Page footer ───────────────────────────────────────────────────────────────

function SovereigntyFooter() {
  const footerGroups = [
    {
      title: 'Assessments',
      links: [
        { label: 'Request Assessment', href: '/?view=assurance#assessments' },
        { label: 'Constitutional Index', href: '/?view=assurance#index' },
        { label: 'Constitutional Matrix', href: '/?view=assurance#map' },
      ],
    },
    {
      title: 'Research',
      links: [
        { label: 'AI Governance vs AI Sovereignty', href: '/ai-governance-vs-ai-sovereignty' },
        { label: 'Methodology', href: '/assurance/methodology' },
        { label: 'Public Research', href: '/assurance/research' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About AOC Assurance', href: '/assurance/about' },
        { label: 'AOC Protocol', href: '/' },
        { label: 'Privacy Policy', href: '/assurance/privacy' },
        { label: 'Terms of Service', href: '/assurance/terms' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com/company/architects-of-change-protocol/', external: true },
        { label: 'X (@archofchange)', href: 'https://x.com/archofchange', external: true },
        { label: 'GitHub', href: 'https://github.com/Architects-of-Change-Protocol/Architects_of_Change_Protocol', external: true },
        { label: 'Contact Us', href: 'mailto:vicvalch@onchainfest.xyz' },
      ],
    },
  ];

  return (
    <footer className="assurance-footer px-6" aria-labelledby="sovereignty-footer-title">
      <div className="max-w-7xl mx-auto assurance-footer-inner">
        <div className="assurance-footer-brand">
          <h2 id="sovereignty-footer-title">AOC Assurance</h2>
          <p>A constitutional assessment framework developed by AOC Protocol.</p>
          <p className="assurance-footer-tagline">Measure Governance.<br />Measure Sovereignty.<br />Understand the Balance.</p>
          <p className="assurance-footer-institutional">AOC Assurance and AOC Protocol are initiatives of OnchainFest LLC.</p>
        </div>
        <nav className="assurance-footer-links" aria-label="Footer navigation">
          {footerGroups.map((group) => (
            <section key={group.title} aria-labelledby={`sov-footer-${group.title.toLowerCase()}`}>
              <h3 id={`sov-footer-${group.title.toLowerCase()}`}>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={'external' in link && link.external ? '_blank' : undefined}
                      rel={'external' in link && link.external ? 'noopener noreferrer' : undefined}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
        <div className="assurance-footer-legal">
          <p>© 2026 OnchainFest LLC. All rights reserved.</p>
          <p>AOC Assurance does not certify organizations as safe, secure, compliant, trustworthy, or risk-free.</p>
          <p>The Constitutional Index is an evidence-based assessment framework designed to evaluate governance and sovereignty characteristics using publicly observable and/or supplied evidence. Constitutional scores represent analytical assessments and should not be interpreted as guarantees, certifications, or endorsements.</p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function WhatIsAiSovereigntyPage() {
  usePageMeta();

  return (
    <main className="min-h-screen bg-[#070d0b] text-white font-sans">
      <SovereigntyNav />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-6 pt-6 pb-0">
        <ol className="flex items-center gap-2 text-xs text-white/35" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <a href="/" className="hover:text-white/60 transition-colors" itemProp="item">
              <span itemProp="name">Home</span>
            </a>
            <meta itemProp="position" content="1" />
          </li>
          <li aria-hidden="true">/</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <a href="/?view=assurance" className="hover:text-white/60 transition-colors" itemProp="item">
              <span itemProp="name">AOC Assurance</span>
            </a>
            <meta itemProp="position" content="2" />
          </li>
          <li aria-hidden="true">/</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <span className="text-white/55" itemProp="name">What is AI Sovereignty?</span>
            <meta itemProp="position" content="3" />
          </li>
        </ol>
      </nav>

      {/* ── Hero ── */}
      <section className="assurance-hero-glow relative pt-20 pb-24 text-center px-6" aria-labelledby="hero-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-6">AOC CONSTITUTIONAL INDEX</p>
        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6 max-w-4xl mx-auto"
        >
          What is AI Sovereignty?
        </h1>
        <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10">
          AI Sovereignty measures how much control an organization truly has over its AI capabilities, infrastructure, data,
          continuity, and operational independence.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/?view=assurance"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-xl transition-colors w-full sm:w-auto"
          >
            Explore AOC Assurance
          </a>
          <a
            href="/?view=assurance#map"
            className="inline-flex items-center justify-center px-6 py-3 border border-white/20 hover:border-white/35 text-white/80 hover:text-white text-sm font-medium rounded-xl transition-colors w-full sm:w-auto"
          >
            View Constitutional Matrix
          </a>
        </div>
      </section>

      {/* ── Section 1: AI Sovereignty Defined ── */}
      <section className="max-w-4xl mx-auto px-6 py-16" aria-labelledby="defined-heading">
        <h2 id="defined-heading" className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
          AI Sovereignty Defined
        </h2>
        <div className="space-y-5 text-base text-white/65 leading-relaxed">
          <p>
            <strong className="text-white/85 font-semibold">AI Sovereignty</strong> is the ability of an organization to own,
            control, operate, move, replace, and preserve independence over the AI capabilities that power its business.
          </p>
          <p>
            Unlike governance, which focuses on supervision and accountability, sovereignty focuses on control.
          </p>
        </div>
        <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 mb-3">The central question of AI Sovereignty</p>
          <p className="text-xl sm:text-2xl font-bold text-white/90 leading-snug">"Who truly controls the capability?"</p>
        </div>
      </section>

      {/* ── Section 2: Why AI Sovereignty Matters ── */}
      <section className="max-w-4xl mx-auto px-6 py-16" aria-labelledby="why-matters-heading">
        <h2 id="why-matters-heading" className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
          Why AI Sovereignty Matters
        </h2>
        <div className="space-y-5 text-base text-white/65 leading-relaxed mb-8">
          <p>
            Organizations increasingly depend on AI providers for models, infrastructure, workflows, and decision support.
          </p>
          <p>When sovereignty is weak, organizations become vulnerable to:</p>
        </div>
        <ul className="space-y-3 text-base text-white/65 mb-8">
          {[
            'Vendor lock-in',
            'Service discontinuation',
            'Model deprecation',
            'Pricing changes',
            'Data portability limitations',
            'Reduced operational autonomy',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-base text-white/65 leading-relaxed">
          AI Sovereignty helps organizations understand and reduce those dependencies.
        </p>
      </section>

      {/* ── Section 3: Key Dimensions ── */}
      <section className="max-w-5xl mx-auto px-6 py-16" aria-labelledby="dimensions-heading">
        <header className="mb-10">
          <h2 id="dimensions-heading" className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            Key Dimensions of AI Sovereignty
          </h2>
          <p className="text-white/55 max-w-2xl leading-relaxed">
            The AOC Constitutional Index evaluates AI Sovereignty across six core dimensions, each representing a distinct
            axis of organizational control.
          </p>
        </header>
        <DimensionsGrid />
      </section>

      {/* ── Section 4: High vs Low Sovereignty ── */}
      <section className="max-w-5xl mx-auto px-6 py-16" aria-labelledby="comparison-heading">
        <h2 id="comparison-heading" className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">
          Examples of High and Low AI Sovereignty
        </h2>
        <SovereigntyComparison />
      </section>

      {/* ── Section 5: AI Sovereignty vs AI Governance ── */}
      <section className="max-w-4xl mx-auto px-6 py-16" aria-labelledby="vs-governance-heading">
        <h2 id="vs-governance-heading" className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
          AI Sovereignty vs AI Governance
        </h2>
        <div className="space-y-5 text-base text-white/65 leading-relaxed mb-8">
          <p>AI Governance and AI Sovereignty are complementary concepts.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400 mb-3">Governance measures</p>
            <p className="text-base font-semibold text-white/90 mb-2">Supervision</p>
            <p className="text-sm text-white/55 leading-relaxed">Governance asks: "Is the system properly managed?"</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 mb-3">Sovereignty measures</p>
            <p className="text-base font-semibold text-white/90 mb-2">Control</p>
            <p className="text-sm text-white/55 leading-relaxed">Sovereignty asks: "Who ultimately controls the capability?"</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <p className="text-base text-white/65 leading-relaxed mb-4">
            An organization can have strong governance while remaining constitutionally dependent on external providers.
            Conversely, high sovereignty without governance creates operational chaos.
          </p>
          <p className="text-base font-semibold text-white/85">Trust requires both.</p>
        </div>
        <div className="mt-8">
          <a
            href="/ai-governance-vs-ai-sovereignty"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          >
            Read: AI Governance vs AI Sovereignty →
          </a>
        </div>
      </section>

      {/* ── Section 6: How AOC Measures AI Sovereignty ── */}
      <section className="max-w-4xl mx-auto px-6 py-16" aria-labelledby="how-aoc-measures-heading">
        <h2 id="how-aoc-measures-heading" className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
          How AOC Measures AI Sovereignty
        </h2>
        <div className="space-y-5 text-base text-white/65 leading-relaxed mb-8">
          <p>
            The <strong className="text-white/85 font-semibold">AOC Constitutional Index</strong> evaluates AI Sovereignty
            using publicly observable evidence and assessment criteria across infrastructure control, portability, continuity,
            provider dependency, model flexibility, and operational independence.
          </p>
          <p>
            The result is an <strong className="text-white/85 font-semibold">AI Sovereignty Score</strong> that helps
            organizations understand their constitutional posture.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Sovereignty Score', desc: 'A quantitative measure of organizational control over AI capabilities.' },
            { label: 'Constitutional Position', desc: 'Placement in the AOC Constitutional Matrix across four quadrants.' },
            { label: 'Dependency Risk Profile', desc: 'Assessment of exposure to provider lock-in and continuity risk.' },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300 mb-2">{card.label}</p>
              <p className="text-sm text-white/55 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/?view=assurance"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-xl transition-colors"
          >
            Explore AOC Assurance
          </a>
          <a
            href="/?view=assurance#index"
            className="inline-flex items-center justify-center px-6 py-3 border border-white/20 hover:border-white/35 text-white/80 hover:text-white text-sm font-medium rounded-xl transition-colors"
          >
            View Constitutional Index
          </a>
        </div>
      </section>

      {/* ── Section 7: FAQ ── */}
      <section className="max-w-4xl mx-auto px-6 py-16" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">
          Frequently Asked Questions
        </h2>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 sm:px-8">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center" aria-labelledby="cta-heading">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 sm:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">AOC CONSTITUTIONAL INDEX</p>
          <h2 id="cta-heading" className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            Understand your AI Sovereignty posture.
          </h2>
          <p className="text-white/55 max-w-xl mx-auto leading-relaxed mb-8">
            AOC Assurance produces a Sovereignty Score, Governance Score, and Constitutional Position for your organization.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/?view=assurance#assessments"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-xl transition-colors w-full sm:w-auto"
            >
              Explore AOC Assurance
            </a>
            <a
              href="/?view=assurance#map"
              className="inline-flex items-center justify-center px-7 py-3.5 border border-white/20 hover:border-white/35 text-white/80 hover:text-white text-sm font-medium rounded-xl transition-colors w-full sm:w-auto"
            >
              View Constitutional Matrix
            </a>
          </div>
        </div>
      </section>

      <SovereigntyFooter />
    </main>
  );
}
