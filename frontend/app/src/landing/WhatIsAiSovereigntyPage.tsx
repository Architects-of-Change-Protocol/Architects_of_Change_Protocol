import { useEffect } from 'react';
import { LogoRotating } from '../components/logo/LogoRotating';
import './assurance.css';

const PAGE_URL = 'https://www.aocprotocol.org/what-is-ai-sovereignty';

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
    setMeta('description', 'AI Sovereignty defines who controls, owns, moves, replaces, and operates the underlying AI capability. Learn how sovereignty shapes trust and constitutional posture.');
    setMeta('keywords', 'What is AI Sovereignty, AI Sovereignty, AI Sovereignty Framework, AI Sovereignty Score, Constitutional AI, AOC Assurance');
    setMeta('robots', 'index, follow');

    const { el: canonicalEl, prevHref: prevCanonical } = setLink('canonical', PAGE_URL);

    setMeta('og:title', 'What is AI Sovereignty? | AOC Assurance', true);
    setMeta('og:description', 'AI Sovereignty defines who controls, owns, moves, replaces, and operates the underlying AI capability.', true);
    setMeta('og:url', PAGE_URL, true);
    setMeta('og:type', 'article', true);
    setMeta('og:image', 'https://www.aocprotocol.org/og-image.png', true);
    setMeta('og:site_name', 'AOC Assurance', true);
    setMeta('twitter:card', 'summary_large_image');

    const jsonLd = document.createElement('script');
    jsonLd.type = 'application/ld+json';
    jsonLd.id = 'what-is-ai-sovereignty-jsonld';
    jsonLd.text = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'What is AI Sovereignty?',
        description: 'AI Sovereignty defines who controls, owns, moves, replaces, and operates the underlying AI capability.',
        url: PAGE_URL,
        publisher: {
          '@type': 'Organization',
          name: 'AOC Assurance',
          url: 'https://www.aocprotocol.org',
        },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'AOC Assurance', item: 'https://www.aocprotocol.org' },
            { '@type': 'ListItem', position: 2, name: 'Research Hub', item: 'https://www.aocprotocol.org/research' },
            { '@type': 'ListItem', position: 3, name: 'What is AI Sovereignty?', item: PAGE_URL },
          ],
        },
      },
    ]);
    document.head.appendChild(jsonLd);

    return () => {
      document.title = prevTitle;
      const injected = document.getElementById('what-is-ai-sovereignty-jsonld');
      if (injected) injected.remove();
      if (prevCanonical !== null) canonicalEl.setAttribute('href', prevCanonical);
    };
  }, []);
}

export function WhatIsAiSovereigntyPage() {
  usePageMeta();

  return (
    <main className="min-h-screen bg-[#070d0b] text-white font-sans antialiased">
      <nav
        className="flex items-center justify-between gap-4 border-b border-white/8 px-4 py-3 sm:px-6"
        aria-label="Page navigation"
      >
        <a href="/research" className="flex items-center gap-2.5" aria-label="Back to Research Hub">
          <LogoRotating size={26} inverted />
          <span className="text-sm font-semibold text-white/90">AOC Assurance</span>
        </a>
        <a href="/research" className="text-xs text-white/50 hover:text-white/80 transition-colors">
          ← Research Hub
        </a>
      </nav>

      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-xs text-white/35">
            <li><a href="/research" className="hover:text-white/60 transition-colors">Research Hub</a></li>
            <li aria-hidden="true">/</li>
            <li className="text-white/55">What is AI Sovereignty?</li>
          </ol>
        </nav>

        <header>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-300/60">Core Concept</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            What is AI Sovereignty?
          </h1>
          <p className="mt-6 text-lg text-white/60 leading-relaxed">
            AI Sovereignty defines who controls, owns, moves, replaces, and operates the
            underlying AI capability — and what happens when that control is tested.
          </p>
        </header>

        <div className="mt-12 rounded-2xl border border-cyan-500/15 bg-cyan-500/[0.03] px-6 py-8 sm:px-8">
          <p className="text-base font-medium text-white/80">
            This article is currently in preparation and will be published to the AOC Research Hub shortly.
          </p>
          <p className="mt-3 text-sm text-white/50 leading-relaxed">
            In the meantime, explore the related article on AI Governance vs AI Sovereignty, which covers how these two dimensions differ and why both matter for constitutional trust.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="/ai-governance-vs-ai-sovereignty"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-300/90 px-5 py-2.5 text-sm font-semibold text-[#031018] transition-colors hover:bg-cyan-200"
            >
              AI Governance vs AI Sovereignty
            </a>
            <a
              href="/research"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-white/30 hover:text-white"
            >
              Back to Research Hub
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}
