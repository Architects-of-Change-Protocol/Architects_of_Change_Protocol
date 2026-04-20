import { useEffect } from 'react';
import { useSession } from '../auth/session';
import { useRouter } from '../app/router';

export function AppEntryPage() {
  const { session } = useSession();
  const { navigate } = useRouter();

  useEffect(() => {
    if (session.role === 'user') {
      navigate('/app/user', true);
      return;
    }
    if (session.role === 'market_maker') {
      navigate('/app/enterprise', true);
      return;
    }
    navigate('/login', true);
  }, [navigate, session.role]);

  return null;
}
