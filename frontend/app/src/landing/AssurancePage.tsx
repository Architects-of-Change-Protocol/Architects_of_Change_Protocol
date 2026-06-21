/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';
import { LogoRotating } from '../components/logo/LogoRotating';
import {
  CONSTITUTIONAL_INDEX_ORGANIZATIONS,
  GOVERNANCE_RANKED,
  SOVEREIGNTY_RANKED,
} from './assuranceIndexData';
import { ConstitutionalBenchmarkExplorer } from './components/ConstitutionalBenchmarkExplorer';
import './assurance.css';

const NAV_ITEMS = [
  { label: 'Risk', href: '#risk' },
  { label: 'Assessments', href: '#assessments' },
  { label: 'Learn More', href: '#learn-more' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Protocol', href: '/' },
];

const FOUNDATION_CHECKOUT_URL = 'https://buy.stripe.com/aFa5kD1Kfgcp67N11gejK01';
const FOUNDER_PROGRAM_CHECKOUT_URL = 'https://buy.stripe.com/3cI7sL88D5xLbs76lAejK00';
const ENTERPRISE_INTAKE_FORM_URL = 'https://tally.so/r/2ER1M9';
const FOUNDER_ESSAY_URL = 'https://www.linkedin.com/pulse/i-started-looking-sovereignty-found-constitutional-valverde-checa-hnpye/';

const FOOTER_LINK_GROUPS = [
  {
    title: 'Assessments',
    links: [
      { label: 'Public Assessment', href: '#assessments' },
      { label: 'Founder Program', href: '#assessments' },
      { label: 'Enterprise Assessment', href: '#assessments' },
      { label: 'Constitutional Index', href: '#index' },
    ],
  },
  {
    title: 'Research',
    links: [
      { label: 'Constitutional Index Methodology', href: '/assurance/methodology' },
      { label: 'Founder Essay', href: FOUNDER_ESSAY_URL, external: true },
      { label: 'Public Research Initiative', href: '/assurance/research' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About AOC Assurance', href: '/assurance/about' },
      { label: 'About AOC Protocol', href: '/' },
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

const RISK_CARDS = [
  {
    title: 'Key Person Risk',
    body: 'Critical operational knowledge lives inside a handful of employees.',
  },
  {
    title: 'Decision Amnesia',
    body: 'Important decisions are remembered as outcomes, but the rationale, evidence, tradeoffs, and accountability chain disappear.',
  },
  {
    title: 'Learning Failure',
    body: 'Teams repeat mistakes because lessons from projects, incidents, and customer work never become institutional capability.',
  },
  {
    title: 'AI Context Risk',
    body: 'AI systems can access documents, but they do not understand how the business actually works.',
  },
  {
    title: 'Knowledge Fragmentation',
    body: 'Operational intelligence is scattered across tools, emails, chats, documents, vendors, and people.',
  },
  {
    title: 'Continuity Risk',
    body: 'Leadership changes, restructuring, and platform migrations erase critical intelligence.',
  },
];

const FRAMEWORK_CARDS = [
  {
    title: 'Governance preserves ownership.',
    body: 'Who owns the decision, the context, the knowledge, and the next action?',
  },
  {
    title: 'Accountability preserves trust.',
    body: 'Can responsibility survive handoffs, leadership changes, vendor transitions, and AI-assisted workflows?',
  },
  {
    title: 'Sovereignty preserves control.',
    body: 'Does the organization control its intelligence, or is it dependent on people, vendors, undocumented history, and external systems?',
  },
];

const ASSESSMENT_DIMENSIONS = [
  {
    title: 'Governance',
    body: 'Visibility into ownership of critical knowledge, decisions, assumptions, and operating context.',
  },
  {
    title: 'Accountability',
    body: 'Clarity of responsibility across handoffs, reorganizations, vendors, and leadership transitions.',
  },
  {
    title: 'Decision Traceability',
    body: 'Ability to reconstruct why important decisions were made, what evidence supported them, and who was accountable.',
  },
  {
    title: 'Organizational Learning',
    body: 'Whether experience from projects, incidents, customers, and operations improves future behavior.',
  },
  {
    title: 'Knowledge Continuity',
    body: 'How much essential know-how would remain usable if key employees left tomorrow.',
  },
  {
    title: 'Institutional Resilience',
    body: 'Capacity to keep performing through turnover, restructuring, migrations, and strategic change.',
  },
  {
    title: 'AI Readiness',
    body: 'Quality of the governed business context available to AI systems, not merely the volume of documents available to them.',
  },
  {
    title: 'Sovereignty',
    body: 'Control over institutional intelligence instead of dependency on individuals, vendors, tools, or undocumented history.',
  },
];

const ASK_YOURSELF_QUESTIONS = [
  'If your most knowledgeable employee resigned tomorrow, what would be lost?',
  'Could you reconstruct the last five strategic decisions?',
  'Does your AI understand your business, or only your documents?',
  'Is your organization learning, or merely accumulating information?',
];

const FAQ_ITEMS = [
  {
    q: 'Is AOC Assurance a knowledge management tool?',
    a: 'No. Knowledge management stores information. AOC Assurance measures whether critical organizational intelligence is governed, traceable, resilient, and usable through change.',
  },
  {
    q: 'Is this replacing the Constitutional Index?',
    a: 'No. The Constitutional Index remains a core AOC evidence layer. The new positioning explains why Governance and Sovereignty matter commercially: they determine whether organizational intelligence can survive change.',
  },
  {
    q: 'Is this a compliance audit?',
    a: 'No. AOC Assurance is an Institutional Intelligence Risk, Knowledge Loss, Continuity, and Constitutional Resilience assessment. It may support governance and compliance conversations, but it is not positioned as a regulatory certification.',
  },
  {
    q: 'Why does this matter for AI transformation?',
    a: 'AI systems amplify the quality of the context they receive. If decision lineage, ownership, accountability, and operating assumptions are missing, AI can accelerate confusion instead of intelligence.',
  },
  {
    q: 'Who is this for?',
    a: 'CEOs, founders, boards, executive teams, AI transformation leaders, and enterprise leaders responsible for continuity, resilience, governance, and strategic learning.',
  },
];

function PublicResearchBridge() {
  return (
    <section className="assurance-research-bridge px-6 py-16" aria-labelledby="research-bridge-heading">
      <div className="max-w-7xl mx-auto assurance-research-bridge-card">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">PUBLIC RESEARCH INITIATIVE</p>
          <h2 id="research-bridge-heading">Mapping the constitutional posture of the AI industry.</h2>
          <p>AOC Assurance continuously evaluates AI organizations using publicly observable evidence to better understand the evolving relationship between Governance and Sovereignty across the industry.</p>
        </div>
        <a href="/assurance/research" className="assurance-research-bridge-link">Explore the Research Initiative</a>
      </div>
    </section>
  );
}

function AssuranceFooter() {
  return (
    <footer className="assurance-footer px-6" aria-labelledby="assurance-footer-title">
      <div className="max-w-7xl mx-auto assurance-footer-inner">
        <div className="assurance-footer-brand">
          <h2 id="assurance-footer-title">AOC Assurance</h2>
          <p>AOC Assurance measures Knowledge Loss, Key Person Dependency, Decision Amnesia, Continuity, and Constitutional Resilience through the AOC Constitutional Framework.</p>
          <p className="assurance-footer-tagline">Measure Governance.<br />Measure Sovereignty.<br />Understand Resilience.</p>
          <p className="assurance-footer-institutional">AOC Assurance and AOC Protocol are initiatives of OnchainFest LLC.</p>
        </div>
        <nav className="assurance-footer-links" aria-label="AOC Assurance footer navigation">
          {FOOTER_LINK_GROUPS.map((group) => (
            <section key={group.title} aria-labelledby={`footer-${group.title.toLowerCase()}`}>
              <h3 id={`footer-${group.title.toLowerCase()}`}>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
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

type LearnMoreId = 'framework' | 'founder-essay' | 'index';

const AssurancePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openLearnMore, setOpenLearnMore] = useState<LearnMoreId | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.assurance-hero-glow');
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const emergingCandidates = CONSTITUTIONAL_INDEX_ORGANIZATIONS.filter(
    (o) => o.quadrant === 'sovereignty-pioneers',
  ).sort((a, b) => (b.governanceScore + b.sovereigntyScore) - (a.governanceScore + a.sovereigntyScore));

  const toggleLearnMore = (id: LearnMoreId) =>
    setOpenLearnMore((prev) => (prev === id ? null : id));

  return (
    <main className="min-h-screen bg-[#070d0b] text-white font-sans">

      {/* ── Sticky CTA (desktop only, appears after Hero) ── */}
      <div
        aria-hidden={!showStickyCta}
        className={`fixed bottom-6 right-6 z-50 hidden md:block transition-all duration-300 ${showStickyCta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <a
          href="#assessments"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-2xl shadow-[0_8px_32px_rgba(52,211,153,0.35)] transition-colors"
        >
          Assess Intelligence Risk
          <span aria-hidden="true">↑</span>
        </a>
      </div>

      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-30 backdrop-blur bg-[#070d0b]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <LogoRotating size={28} inverted />
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold tracking-tighter">AOC</span>
              <span className="text-xs text-emerald-400 uppercase tracking-[0.2em]">Assurance</span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-9 text-sm font-medium text-white/70">
            {NAV_ITEMS.map((item) => (
              <a key={item.label} href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
          </div>

          <a
            href="#assessments"
            className="hidden md:inline-block px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-xl transition-colors"
          >
            Assess Intelligence Risk
          </a>

          <button
            type="button"
            className="relative flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white transition-colors hover:border-white/30 hover:bg-white/5"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="assurance-mobile-nav"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            <span className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
            <span className={`absolute h-0.5 w-5 bg-current transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute h-0.5 w-5 bg-current transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
          </button>
        </div>

        <div
          id="assurance-mobile-nav"
          aria-hidden={!isMobileMenuOpen}
          inert={!isMobileMenuOpen}
          className={`absolute left-0 right-0 top-full overflow-hidden border-b border-white/10 bg-[#070d0b]/95 backdrop-blur-lg transition-[max-height,opacity] duration-300 ease-out md:hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`}
        >
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-xl px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="assurance-hero-glow relative pt-28 pb-32 text-center px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-6">
          AOC Assurance
        </p>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-[-2.5px] leading-[1.05] max-w-4xl mx-auto mb-8">
          How much of your company's intelligence would survive tomorrow?
        </h1>
        <p className="max-w-xl mx-auto text-lg md:text-xl text-white/65 leading-relaxed mb-12">
          Most companies are one resignation away from losing critical intelligence.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <a
            href="#assessments"
            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg rounded-2xl transition-colors"
          >
            Assess Intelligence Risk
          </a>
          <a
            href="#learn-more"
            className="px-10 py-4 border border-white/15 hover:border-white/30 text-white font-semibold text-lg rounded-2xl transition-colors"
          >
            Explore the Constitutional Framework
          </a>
        </div>
        <p className="text-xs text-white/40 tracking-wide">
          Powered by the AOC Constitutional Framework
        </p>
      </section>

      <hr className="assurance-divider" />

      {/* ── Risk Section ── */}
      <section id="risk" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Hidden risks most organizations cannot see.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Critical knowledge rarely disappears all at once. It erodes through resignations, promotions,
              retirements, restructurings, vendor transitions, platform migrations, and decisions nobody
              can reconstruct six months later.
            </p>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RISK_CARDS.map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
                <h3 className="text-lg font-semibold mb-3">{card.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Ask Yourself Section ── */}
      <section className="scroll-mt-20 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              Ask Yourself
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              The questions that expose Knowledge Loss before it becomes a crisis.
            </h2>
          </header>

          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {ASK_YOURSELF_QUESTIONS.map((q) => (
              <div key={q} className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
                <p className="text-lg text-white/80 leading-relaxed">{q}</p>
              </div>
            ))}
          </div>

          <p className="max-w-3xl text-white/55 text-base leading-relaxed">
            If those answers are unclear, the issue is not a tooling gap. It is a Governance, Accountability,
            and Sovereignty gap — the reason Knowledge Loss, Key Person Dependency, Decision Amnesia, weak
            Continuity, and poor Organizational Learning keep returning.
          </p>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Assessments Section ── */}
      <section id="assessments" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-16 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              Assessments
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-5">
              Choose the assessment depth your organization needs.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Start with public evidence, go deeper with founder-level analysis, or assess enterprise-wide
              intelligence continuity risk across teams, vendors, systems, and AI initiatives.
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Public Assessment */}
            <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 flex flex-col">
              <div className="mb-5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-emerald-400">
                  Public Assessment
                </p>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-semibold text-white">$49</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold">Public Assessment</h3>
                <p className="mt-2 text-sm text-white/55 leading-relaxed">
                  A rapid external assessment of publicly observable signals related to Governance,
                  Sovereignty, decision traceability, and institutional resilience.
                </p>
              </div>
              <ul className="flex-1 space-y-2 mb-8">
                {[
                  'Governance Score',
                  'Sovereignty Score',
                  'Constitutional Position',
                  'Knowledge Loss and Continuity Snapshot',
                  'Executive Summary',
                  'Public Index Listing when applicable',
                  'Delivered within 72 hours',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={FOUNDATION_CHECKOUT_URL}
                target="_blank"
                rel="noreferrer"
                className="text-center py-3 rounded-xl text-sm font-semibold border border-white/15 hover:border-white/30 text-white transition-colors"
              >
                Start Public Assessment
              </a>
            </article>

            {/* Founder Program */}
            <article className="rounded-2xl border border-emerald-500/50 bg-emerald-950/35 shadow-[0_0_40px_rgba(52,211,153,0.08)] p-7 flex flex-col relative">
              <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-emerald-500/20" />
              <div className="mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-emerald-400">
                    Founder Program
                  </p>
                  <span className="inline-flex items-center text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                    Most Popular
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-semibold text-emerald-300">$149</span>
                  <span className="text-xs text-white/35 line-through">Future public price: $499</span>
                </div>
                <p className="mt-1 text-xs text-amber-300/70 font-medium">
                  Founder Pricing — Limited to the first 25 organizations
                </p>
                <h3 className="mt-3 text-xl font-semibold">Founder Program</h3>
                <p className="mt-2 text-sm text-white/55 leading-relaxed">
                  A deeper analysis for founders and leadership teams who want to understand where
                  intelligence continuity, accountability, AI readiness, and sovereignty risks are emerging.
                </p>
              </div>
              <ul className="flex-1 space-y-2 mb-8">
                {[
                  'Everything in Public Assessment',
                  'Knowledge Loss and Key Person Dependency Review',
                  'Key-Person and Knowledge Continuity Findings',
                  'Governance and Sovereignty Constraint Analysis',
                  'Decision Traceability Review',
                  'AI Readiness Observations',
                  'Prioritized Improvement Roadmap',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={FOUNDER_PROGRAM_CHECKOUT_URL}
                target="_blank"
                rel="noreferrer"
                className="text-center py-3 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors"
              >
                Join Founder Program
              </a>
            </article>

            {/* Enterprise Assessment */}
            <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 flex flex-col">
              <div className="mb-5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-emerald-400">
                  Enterprise Assessment
                </p>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-semibold text-white">Contact Sales</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold">Enterprise Assessment</h3>
                <p className="mt-2 text-sm text-white/55 leading-relaxed">
                  A strategic assessment for organizations seeking to measure and reduce hidden intelligence
                  continuity risk across teams, vendors, systems, AI initiatives, and critical operations.
                </p>
              </div>
              <ul className="flex-1 space-y-2 mb-8">
                {[
                  'Everything in Founder Program',
                  'Enterprise Risk Register',
                  'Knowledge Continuity Review',
                  'Decision Lineage and Accountability Mapping',
                  'AI Context and Governance Review',
                  'Institutional Resilience Roadmap',
                  'Executive Briefing',
                  'AOC Enterprise Readiness Plan',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={ENTERPRISE_INTAKE_FORM_URL}
                target="_blank"
                rel="noreferrer"
                className="text-center py-3 rounded-xl text-sm font-semibold border border-white/15 hover:border-white/30 text-white transition-colors"
              >
                Request Enterprise Briefing
              </a>
            </article>
          </div>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Enterprise Bridge ── */}
      <section className="py-28 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Assessment is the first step. Enterprise is how intelligence becomes durable.
          </h2>
          <p className="text-white/55 text-lg mb-10 leading-relaxed">
            AOC Assurance identifies where institutional intelligence is fragile. AOC Enterprise helps
            organizations build the operating layer required to preserve decisions, govern accountability,
            improve learning, and maintain sovereignty over critical knowledge as the organization grows.
          </p>
          <a
            href="/?view=enterprise"
            className="inline-flex items-center px-10 py-4 border border-white/15 hover:border-white/30 text-white font-semibold text-lg rounded-2xl transition-colors"
          >
            Explore AOC Enterprise
          </a>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── Learn More Section ── */}
      <section id="learn-more" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              Learn More
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
              Learn More
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Explore the ideas behind AOC Assurance.
            </p>
          </header>

          <div className="space-y-3">

            {/* Card 1: Why does this happen? — Constitutional Framework */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between gap-4 px-7 py-6 text-left hover:bg-white/[0.02] transition-colors"
                aria-expanded={openLearnMore === 'framework'}
                onClick={() => toggleLearnMore('framework')}
              >
                <span className="text-xl font-semibold">Why does this happen?</span>
                <span
                  aria-hidden="true"
                  className={`flex-shrink-0 text-emerald-400 text-xl font-light transition-transform duration-300 ${openLearnMore === 'framework' ? 'rotate-45' : ''}`}
                >
                  +
                </span>
              </button>
              {openLearnMore === 'framework' && (
                <div className="px-7 pb-8 border-t border-white/10">
                  <div className="pt-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
                      AOC Constitutional Framework
                    </p>
                    <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-5">
                      These are not just knowledge problems. They are constitutional failures.
                    </h3>
                    <p className="text-white/60 text-base leading-relaxed mb-8">
                      Most organizations do not have a data problem. They have a continuity problem. Intelligence
                      cannot survive without governance. Learning cannot scale without accountability. Resilience
                      cannot exist without sovereignty. AOC Assurance evaluates the constitutional conditions that
                      determine whether organizational intelligence remains durable, traceable, and usable through change.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mb-10">
                      {FRAMEWORK_CARDS.map((card) => (
                        <div key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
                          <h4 className="text-base font-semibold mb-3">{card.title}</h4>
                          <p className="text-white/60 text-sm leading-relaxed">{card.body}</p>
                        </div>
                      ))}
                    </div>

                    <h4 className="text-xl md:text-2xl font-semibold tracking-tight mb-5">
                      AOC Assurance measures whether your intelligence can survive change.
                    </h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {ASSESSMENT_DIMENSIONS.map((dim) => (
                        <div key={dim.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                          <p className="text-emerald-400 text-sm font-semibold mb-2">{dim.title}</p>
                          <p className="text-white/55 text-sm leading-relaxed">{dim.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Why did we create AOC? — Founder Essay */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between gap-4 px-7 py-6 text-left hover:bg-white/[0.02] transition-colors"
                aria-expanded={openLearnMore === 'founder-essay'}
                onClick={() => toggleLearnMore('founder-essay')}
              >
                <span className="text-xl font-semibold">Why did we create AOC?</span>
                <span
                  aria-hidden="true"
                  className={`flex-shrink-0 text-emerald-400 text-xl font-light transition-transform duration-300 ${openLearnMore === 'founder-essay' ? 'rotate-45' : ''}`}
                >
                  +
                </span>
              </button>
              {openLearnMore === 'founder-essay' && (
                <div className="px-7 pb-8 border-t border-white/10">
                  <div className="pt-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
                      Founder Essay
                    </p>
                    <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
                      Why Governance Alone Is Not Enough
                    </h3>
                    <p className="text-xl font-medium text-white/70 leading-snug mb-8">
                      I Started Looking for Sovereignty. I Found a Constitutional Problem.
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10">
                      <p className="text-white/70 text-base leading-relaxed mb-6">
                        Most organizations believe that if they govern their data well enough, they will be resilient. They invest in policies, frameworks, and tools. They document decisions. They deploy knowledge management systems. They add governance layers on top of governance layers.
                      </p>
                      <p className="text-white/70 text-base leading-relaxed mb-6">
                        And yet critical intelligence keeps disappearing. Key employees leave and take context with them. Strategic decisions are made again because nobody can reconstruct why the original decision was made. AI systems are deployed but cannot understand the business they are supposed to serve. Organizations grow but do not learn.
                      </p>
                      <p className="text-white/70 text-base leading-relaxed mb-6">
                        When I started investigating why this keeps happening, I expected to find a data problem. What I found instead was a constitutional problem.
                      </p>
                      <p className="text-white/70 text-base leading-relaxed mb-8">
                        Governance defines who owns a decision. Accountability defines who is responsible when it fails. Sovereignty defines whether the organization actually controls its intelligence — or whether that intelligence lives inside people, tools, and vendor relationships it cannot govern. Without all three, organizational intelligence is fragile by design.
                      </p>
                      <a
                        href={FOUNDER_ESSAY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors"
                      >
                        Read the full essay on LinkedIn
                        <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: See the Public Benchmark — Constitutional Index */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between gap-4 px-7 py-6 text-left hover:bg-white/[0.02] transition-colors"
                aria-expanded={openLearnMore === 'index'}
                onClick={() => toggleLearnMore('index')}
              >
                <span className="text-xl font-semibold">See the Public Benchmark</span>
                <span
                  aria-hidden="true"
                  className={`flex-shrink-0 text-emerald-400 text-xl font-light transition-transform duration-300 ${openLearnMore === 'index' ? 'rotate-45' : ''}`}
                >
                  +
                </span>
              </button>
              {openLearnMore === 'index' && (
                <div className="px-7 pb-8 border-t border-white/10">
                  <div id="index" className="scroll-mt-20 pt-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
                      Constitutional Index
                    </p>
                    <h3 className="text-2xl md:text-4xl font-semibold tracking-tight mb-5">
                      A public benchmark for Governance and Sovereignty in the AI industry.
                    </h3>
                    <p className="text-white/60 text-base leading-relaxed mb-4">
                      The AOC Constitutional Index evaluates AI organizations across Governance and Sovereignty
                      dimensions. It provides a public evidence layer for understanding how organizations balance
                      accountability, control, dependency, and institutional resilience.
                    </p>
                    {emergingCandidates.length > 0 && (
                      <p className="mb-8 text-sm text-white/40">
                        {CONSTITUTIONAL_INDEX_ORGANIZATIONS.length} organizations assessed.
                        Closest emerging candidate: {emergingCandidates[0].name}.
                      </p>
                    )}

                    <ConstitutionalBenchmarkExplorer />

                    <div className="grid md:grid-cols-2 gap-6 mt-10">
                      <div className="ci-leader-panel">
                        <p className="ci-leader-panel-title">Governance Score Leaders</p>
                        <ol className="ci-leader-list">
                          {GOVERNANCE_RANKED.slice(0, 3).map((org, i) => (
                            <li key={org.id} className="ci-leader-item">
                              <span className="ci-leader-rank">{i + 1}</span>
                              <div className="ci-leader-meta">
                                <strong>{org.name}</strong>
                                <span>{org.quadrantLabel}</span>
                              </div>
                              <strong className="ci-leader-score">{org.governanceScore}</strong>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="ci-leader-panel">
                        <p className="ci-leader-panel-title">Sovereignty Score Leaders</p>
                        <ol className="ci-leader-list">
                          {SOVEREIGNTY_RANKED.slice(0, 3).map((org, i) => (
                            <li key={org.id} className="ci-leader-item">
                              <span className="ci-leader-rank">{i + 1}</span>
                              <div className="ci-leader-meta">
                                <strong>{org.name}</strong>
                                <span>{org.quadrantLabel}</span>
                              </div>
                              <strong className="ci-leader-score ci-leader-score--sovereignty">{org.sovereigntyScore}</strong>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      <hr className="assurance-divider" />

      {/* ── FAQ Section ── */}
      <section id="faq" className="scroll-mt-20 py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 mb-4">
              FAQ
            </p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Common questions.
            </h2>
          </header>

          <dl className="space-y-8">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
                <dt className="text-lg font-semibold mb-3">{item.q}</dt>
                <dd className="text-white/60 text-base leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <PublicResearchBridge />
      <AssuranceFooter />

    </main>
  );
};

export const renderAssurancePage = () => <AssurancePage />;
