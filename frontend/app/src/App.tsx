import { SessionProvider, useSession } from './auth/session';
import { AppShell } from './app/AppShell';
import { RouterProvider, useRouter } from './app/router';
import { renderAocLandingPage } from './landing/AocLandingPage';
import { renderEnterprisePage } from './landing/EnterprisePage';
import { AppEntryPage } from './pages/AppEntryPage';
import { EnterpriseConsolePage } from './pages/EnterpriseConsolePage';
import { LoginPage } from './pages/LoginPage';
import { UserConsolePage } from './pages/UserConsolePage';

function AppContent() {
  const { pathname } = useRouter();
  const { session } = useSession();

  if (pathname === '/') return renderAocLandingPage();
  if (pathname === '/enterprise') return renderEnterprisePage();
  if (pathname === '/login') return <LoginPage />;

  if (pathname.startsWith('/app')) {
    if (!session.authenticated) {
      return <LoginPage />;
    }

    let page = <AppEntryPage />;

    if (pathname === '/app/user') {
      page = session.role === 'user' ? <UserConsolePage /> : <AppEntryPage />;
    }

    if (pathname === '/app/enterprise') {
      page = session.role === 'market_maker' ? <EnterpriseConsolePage /> : <AppEntryPage />;
    }

    return <AppShell>{page}</AppShell>;
  }

  return renderAocLandingPage();
}

function App() {
  return (
    <SessionProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </SessionProvider>
  );
}

export default App;
