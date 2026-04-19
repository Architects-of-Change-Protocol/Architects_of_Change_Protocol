import { renderAocLandingPage } from './landing/AocLandingPage';
import { renderEnterprisePage } from './landing/EnterprisePage';
import { renderLaunchEntryPage } from './launch/LaunchEntryPage';

function App() {
  if (window.location.pathname === '/enterprise') return renderEnterprisePage();
  if (window.location.pathname === '/app') return renderLaunchEntryPage();
  return renderAocLandingPage();
}

export default App;
