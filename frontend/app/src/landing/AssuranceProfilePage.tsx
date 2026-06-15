import { LogoRotating } from '../components/logo/LogoRotating';
import {
  ASSURANCE_INDEX_ORGANIZATIONS,
  type AssuranceIndexOrganization,
} from './assuranceIndexData';
import './assurance.css';

const ENTERPRISE_URL = '/?view=enterprise';

function formatAssessmentDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

function ScoreCard({
  label,
  score,
  tone = 'sovereignty',
}: {
  label: string;
  score: number;
  tone?: 'sovereignty' | 'governance';
}) {
  return (
    <article className={`assurance-profile-score-card assurance-profile-score-card--${tone}`}>
      <p>{label}</p>
      <div className="assurance-profile-score-value">
        <strong>{score}</strong>
        <span>/ 100</span>
      </div>
      <div className="assurance-index-score-track" aria-hidden="true">
        <span style={{ width: `${score}%` }} />
      </div>
    </article>
  );
}

function ProfileContent({
  organization,
}: {
  organization: AssuranceIndexOrganization;
}) {
  return (
    <>
      <header className="assurance-profile-header">
        <div>
          <a className="assurance-profile-back" href="/?view=assurance#index">
            <span aria-hidden="true">←</span> Constitutional Index
          </a>
          <p className="assurance-profile-eyebrow">Public Constitutional Profile</p>
          <h1>{organization.name}</h1>
        </div>
        <span
          className={`assurance-index-tier assurance-index-tier--${organization.certificationClass}`}
        >
          {organization.certification} Certification
        </span>
        <dl className="assurance-profile-meta">
          <div>
            <dt>Assessment Number</dt>
            <dd>{organization.assessmentNumber}</dd>
          </div>
          <div>
            <dt>Assessment Date</dt>
            <dd>{formatAssessmentDate(organization.assessmentDate)}</dd>
          </div>
        </dl>
      </header>

      <section className="assurance-profile-scores" aria-label="Public assessment scores">
        <ScoreCard label="Sovereignty Score" score={organization.sovereigntyScore} />
        <ScoreCard
          label="Governance Score"
          score={organization.governanceScore}
          tone="governance"
        />
      </section>

      <section className="assurance-profile-section">
        <p className="assurance-profile-section-label">Executive Summary</p>
        <h2>Constitutional posture at a glance</h2>
        <p className="assurance-profile-summary">{organization.summary}</p>
      </section>

      <div className="assurance-profile-findings">
        <section className="assurance-profile-section">
          <p className="assurance-profile-section-label">Strengths</p>
          <h2>Observed strengths</h2>
          <ul>
            {organization.strengths.map((strength) => (
              <li key={strength}>
                <span aria-hidden="true">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </section>
        <section className="assurance-profile-section">
          <p className="assurance-profile-section-label assurance-profile-section-label--muted">
            Constraints
          </p>
          <h2>Public assessment constraints</h2>
          <ul className="assurance-profile-constraints">
            {organization.constraints.map((constraint) => (
              <li key={constraint}>
                <span aria-hidden="true">—</span>
                {constraint}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="assurance-profile-section assurance-profile-audit-section">
        <p className="assurance-profile-section-label assurance-profile-section-label--governance">
          Governance Audit Details
        </p>
        <h2>Qualitative governance assessment</h2>
        <div className="assurance-profile-audit-grid">
          {organization.governanceAudit.map((audit) => (
            <article className="assurance-profile-audit-card" key={audit.title}>
              <div className="assurance-profile-audit-card-header">
                <h3>{audit.title}</h3>
                <span>{audit.status}</span>
              </div>
              <dl>
                <div>
                  <dt>Finding</dt>
                  <dd>{audit.finding}</dd>
                </div>
                <div>
                  <dt>Risk</dt>
                  <dd>{audit.risk}</dd>
                </div>
                {audit.evidence ? (
                  <div>
                    <dt>Evidence Observed</dt>
                    <dd>{audit.evidence}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Recommendation</dt>
                  <dd>{audit.recommendation}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="assurance-profile-cta">
        <div>
          <p className="assurance-profile-section-label">Complete Assessment</p>
          <h2>Represent this organization?</h2>
          <p>
            Unlock the complete AOC Constitutional Assessment including findings, evidence review,
            domain analysis, and recommendations.
          </p>
        </div>
        <div className="assurance-profile-cta-actions">
          <a
            className="assurance-profile-primary-cta"
            href={organization.fullAssessmentCheckoutUrl}
            target="_blank"
            rel="noreferrer"
          >
            {organization.fullAssessmentCtaLabel}
          </a>
          <a className="assurance-profile-secondary-cta" href={ENTERPRISE_URL}>
            Explore AOC Enterprise
          </a>
        </div>
      </section>
    </>
  );
}

export function AssuranceProfilePage({ slug }: { slug: string }) {
  const organization = ASSURANCE_INDEX_ORGANIZATIONS.find((entry) => entry.slug === slug);

  return (
    <main className="min-h-screen bg-[#070d0b] text-white font-sans">
      <nav className="sticky top-0 z-30 backdrop-blur bg-[#070d0b]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <a href="/?view=assurance" className="flex items-center gap-3">
            <LogoRotating size={28} inverted />
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold tracking-tighter">AOC</span>
              <span className="text-xs text-emerald-400 uppercase tracking-[0.2em]">Assurance</span>
            </div>
          </a>
          <a className="assurance-profile-nav-link" href="/?view=assurance#index">
            Constitutional Index
          </a>
        </div>
      </nav>

      <div className="assurance-profile-page">
        {organization ? (
          <ProfileContent organization={organization} />
        ) : (
          <section className="assurance-profile-not-found">
            <p className="assurance-profile-eyebrow">Public Constitutional Profile</p>
            <h1>Organization not found</h1>
            <p>This organization does not have a public AOC Constitutional Index profile.</p>
            <a className="assurance-profile-primary-cta" href="/?view=assurance#index">
              Return to the Index
            </a>
          </section>
        )}
      </div>
    </main>
  );
}
