import { renderAocLandingPage } from './landing/AocLandingPage';
import { renderEnterprisePage } from './landing/EnterprisePage';

function App() {
  if (window.location.pathname === '/enterprise') return renderEnterprisePage();
  return renderAocLandingPage();
}

export default App;
