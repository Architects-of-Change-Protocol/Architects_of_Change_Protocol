import { useEffect, useState } from 'react';
import { renderAocLandingPage } from './landing/AocLandingPage';
import { renderAssurancePage } from './landing/AssurancePage';
import { renderEnterprisePage } from './landing/EnterprisePage';
import { renderDocsPage } from './landing/DocsPage';
import { renderContactPage } from './landing/ContactPage';

function getView() {
  const params = new URLSearchParams(window.location.search);
  return params.get('view') || 'landing';
}

export default function App() {
  const [view, setView] = useState(getView());

  useEffect(() => {
    const sync = () => setView(getView());
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  if (view === 'assurance') return renderAssurancePage();
  if (view === 'docs') return renderDocsPage();
  if (view === 'enterprise') return renderEnterprisePage();
  if (view === 'contact') return renderContactPage();

  return renderAocLandingPage();
}
