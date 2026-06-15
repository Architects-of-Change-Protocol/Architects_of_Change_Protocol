import { useEffect, useState } from 'react';
import { AocLandingPage } from './landing/AocLandingPage';
import { renderAssurancePage } from './landing/AssurancePage';
import { AssuranceProfilePage } from './landing/AssuranceProfilePage';
import { renderEnterprisePage } from './landing/EnterprisePage';
import { renderDocsPage } from './landing/DocsPage';
import { renderContactPage } from './landing/ContactPage';

function getView() {
  const params = new URLSearchParams(window.location.search);
  return params.get('view') || 'landing';
}

export default function App() {
  const [view, setView] = useState(getView());
  const assuranceProfileMatch = window.location.pathname.match(
    /^\/assurance\/index\/([^/]+)\/?$/
  );

  useEffect(() => {
    const sync = () => setView(getView());
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  if (assuranceProfileMatch) {
    return <AssuranceProfilePage slug={decodeURIComponent(assuranceProfileMatch[1])} />;
  }
  if (view === 'assurance') return renderAssurancePage();
  if (view === 'docs') return renderDocsPage();
  if (view === 'enterprise') return renderEnterprisePage();
  if (view === 'contact') return renderContactPage();

  return <AocLandingPage />;
}
