import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-aoc-primary">AOC</span>
              <span className="text-sm text-gray-500">Protocol</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#what" className="text-gray-600 hover:text-aoc-primary transition-colors">
                About
              </a>
              <a href="#specs" className="text-gray-600 hover:text-aoc-primary transition-colors">
                Specs
              </a>
              <a href="#builders" className="text-gray-600 hover:text-aoc-primary transition-colors">
                Build
              </a>
              <a
                href="https://github.com/Architects-of-Change-Protocol/Architects_of_Change_Protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-aoc-primary text-white px-4 py-2 rounded-lg hover:bg-aoc-secondary transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-aoc-primary mb-6 text-balance">
            The Individual is the Architect of Their Own System.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto text-balance">
            AOC Protocol is an open standard that enables citizens to control their data
            and nations to adopt interoperable sovereignty infrastructure—powering a
            collaborative data economy with consent at the core.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/docs/charter/"
              className="bg-aoc-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-aoc-secondary transition-colors"
            >
              Read the Charter (v0.1)
            </a>
            <a
              href="/docs/sovereign-data-language/"
              className="border-2 border-aoc-primary text-aoc-primary px-6 py-3 rounded-lg font-semibold hover:bg-aoc-light transition-colors"
            >
              Sovereign Data Language
            </a>
            <a
              href="/docs/sovereign-wallet/"
              className="border-2 border-aoc-primary text-aoc-primary px-6 py-3 rounded-lg font-semibold hover:bg-aoc-light transition-colors"
            >
              Sovereign Wallet Spec
            </a>
            <a
              href="https://github.com/Architects-of-Change-Protocol/Architects_of_Change_Protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </section>

      {/* What is AOC Protocol */}
      <section id="what" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-aoc-primary mb-6 text-center">
            What is AOC Protocol?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12">
            Architects of Change Protocol is an open, neutral, and public protocol designed
            to enable digital sovereignty for individuals and nations. It defines the
            foundational architecture where individuals own their data, nations guarantee
            digital rights, and markets operate through explicit consent.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-aoc-light rounded-xl p-6">
              <div className="w-12 h-12 bg-aoc-primary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-aoc-primary mb-2">Self-Sovereign</h3>
              <p className="text-gray-600">
                Every human being is the primary owner of their digital identity and data.
                No platform or state is the default owner.
              </p>
            </div>
            <div className="bg-aoc-light rounded-xl p-6">
              <div className="w-12 h-12 bg-aoc-primary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-aoc-primary mb-2">Consent-First</h3>
              <p className="text-gray-600">
                All data access must be explicit, granular, revocable, and purpose-bound.
                Silently harvested data is incompatible.
              </p>
            </div>
            <div className="bg-aoc-light rounded-xl p-6">
              <div className="w-12 h-12 bg-aoc-primary rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-aoc-primary mb-2">Interoperable</h3>
              <p className="text-gray-600">
                Local-first, global-compatible. Nations implement local infrastructure
                while remaining compatible with open protocol interfaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Nations Adopt It */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-aoc-light to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-aoc-primary mb-6 text-center">
            Why Nations Adopt It
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12">
            Nations may adopt the protocol as public digital infrastructure to guarantee
            citizen data ownership at the infrastructure level.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-aoc-accent rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-aoc-primary mb-1">Guarantee Citizen Rights</h3>
                <p className="text-gray-600">Enforce data ownership and consent standards at infrastructure level.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-aoc-accent rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-aoc-primary mb-1">Issue Sovereign Wallets</h3>
                <p className="text-gray-600">Provide citizens with secure, portable data vaults they control.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-aoc-accent rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-aoc-primary mb-1">Certify Compliant Markets</h3>
                <p className="text-gray-600">Enable a trusted ecosystem of consent-based services.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-aoc-accent rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-aoc-primary mb-1">Neutral Sovereignty</h3>
                <p className="text-gray-600">Adoption is voluntary. No central authority controls implementation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Citizens Benefit */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-aoc-primary mb-6 text-center">
            Why Citizens Benefit
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center mb-12">
            Each individual is the architect of their own digital system. The protocol
            assumes human agency as a first-class primitive.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-xl p-6 hover:border-aoc-accent transition-colors">
              <h3 className="text-lg font-semibold text-aoc-primary mb-3">Own Your Data</h3>
              <p className="text-gray-600 text-sm">
                Create, populate, and control your data fields. No platform owns your information by default.
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-6 hover:border-aoc-accent transition-colors">
              <h3 className="text-lg font-semibold text-aoc-primary mb-3">Granular Consent</h3>
              <p className="text-gray-600 text-sm">
                Approve exactly what data to share, with whom, for what purpose, and for how long.
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-6 hover:border-aoc-accent transition-colors">
              <h3 className="text-lg font-semibold text-aoc-primary mb-3">Revoke Anytime</h3>
              <p className="text-gray-600 text-sm">
                Withdraw access at any moment. Your consent is never permanent unless you want it to be.
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-6 hover:border-aoc-accent transition-colors">
              <h3 className="text-lg font-semibold text-aoc-primary mb-3">Portable Identity</h3>
              <p className="text-gray-600 text-sm">
                Take your data anywhere. Migrate between services without starting over.
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-6 hover:border-aoc-accent transition-colors">
              <h3 className="text-lg font-semibold text-aoc-primary mb-3">Privacy by Design</h3>
              <p className="text-gray-600 text-sm">
                Share proofs instead of raw data. Prove you&apos;re over 21 without revealing your birthday.
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-6 hover:border-aoc-accent transition-colors">
              <h3 className="text-lg font-semibold text-aoc-primary mb-3">Economic Participation</h3>
              <p className="text-gray-600 text-sm">
                Markets may pay for consented data access. Participate in the data economy on your terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Specs */}
      <section id="specs" className="py-20 px-4 sm:px-6 lg:px-8 bg-aoc-primary text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
            Core Specifications
          </h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto text-center mb-12">
            The protocol defines modular, interoperable layers. Each specification is
            public, open source, versioned, and auditable.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="/docs/charter/"
              className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-colors group"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-200 transition-colors">
                Charter
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                The foundational document defining purpose, principles, and governance philosophy
                of the protocol.
              </p>
              <span className="text-blue-200 text-sm font-medium">Read Charter v0.1 →</span>
            </a>
            <a
              href="/docs/sovereign-data-language/"
              className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-colors group"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-200 transition-colors">
                Sovereign Data Language (SDL)
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                An open, universal language for describing human data in a sovereign, portable,
                and interoperable way.
              </p>
              <span className="text-blue-200 text-sm font-medium">Read SDL Spec →</span>
            </a>
            <a
              href="/docs/sovereign-wallet/"
              className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-colors group"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-200 transition-colors">
                Sovereign Wallet
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                A personal data vault controlled by the individual. Not merely a crypto wallet—a
                personal data operating system.
              </p>
              <span className="text-blue-200 text-sm font-medium">Read Wallet Spec →</span>
            </a>
            <a
              href="/docs/market-makers/"
              className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/20 transition-colors group"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-200 transition-colors">
                Market Makers
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                Domain-specific engines that request and process sovereign data through
                wallet-mediated consent.
              </p>
              <span className="text-blue-200 text-sm font-medium">Read Market Makers Spec →</span>
            </a>
          </div>
        </div>
      </section>

      {/* Governance */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-aoc-primary mb-6">
            Open Governance
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            This protocol does not belong to any company, government, or private entity.
            It belongs to humanity. Governance favors rough consensus, open discussion,
            transparent proposals, and public version history.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-gray-100 px-4 py-2 rounded-full text-gray-700">No Hidden Governance</span>
            <span className="bg-gray-100 px-4 py-2 rounded-full text-gray-700">No Closed Councils</span>
            <span className="bg-gray-100 px-4 py-2 rounded-full text-gray-700">Public Proposals</span>
            <span className="bg-gray-100 px-4 py-2 rounded-full text-gray-700">Versioned Acceptance</span>
          </div>
        </div>
      </section>

      {/* Call for Builders */}
      <section id="builders" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-aoc-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-aoc-primary mb-6">
            Build With Us
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            AOC Protocol is open source. All specifications are public, versioned, and
            auditable. Reference implementations may vary, but specifications remain neutral.
            Join the movement to build sovereign data infrastructure.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/Architects-of-Change-Protocol/Architects_of_Change_Protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span>View on GitHub</span>
            </a>
            <a
              href="/docs/charter/"
              className="border-2 border-aoc-primary text-aoc-primary px-6 py-3 rounded-lg font-semibold hover:bg-aoc-light transition-colors"
            >
              Read the Charter
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-aoc-secondary text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-bold">AOC</span>
                <span className="text-sm text-gray-400">Protocol</span>
              </div>
              <p className="text-gray-400 text-sm">
                Open rails for consent, identity, and sovereign data exchange.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Specifications</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/docs/charter/" className="hover:text-white transition-colors">Charter</a></li>
                <li><a href="/docs/sovereign-data-language/" className="hover:text-white transition-colors">Sovereign Data Language</a></li>
                <li><a href="/docs/sovereign-wallet/" className="hover:text-white transition-colors">Sovereign Wallet</a></li>
                <li><a href="/docs/market-makers/" className="hover:text-white transition-colors">Market Makers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="https://github.com/Architects-of-Change-Protocol/Architects_of_Change_Protocol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Domain</h4>
              <p className="text-sm text-gray-400">
                <a href="https://aocprotocol.org" className="hover:text-white transition-colors">
                  aocprotocol.org
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>This protocol belongs to humanity. Open source, open governance.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
