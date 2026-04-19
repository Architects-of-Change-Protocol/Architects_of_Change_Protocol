import { AocLandingPage } from './landing/AocLandingPage';
import { EnterprisePage } from './landing/EnterprisePage';

function App() {
  if (window.location.pathname === '/enterprise') return <EnterprisePage />;
  return <AocLandingPage />;
}

export default App;
