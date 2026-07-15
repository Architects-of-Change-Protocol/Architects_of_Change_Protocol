export const MOCK_SUBJECT_ID = 'subject-1';
export const MOCK_REQUESTER_ID = 'requester-1';

export type RuntimeConsumerAuthority = {
  resolveRole: (session: { role: string | null }) => string;
  isAuthenticated: (session: { role: string | null }) => boolean;
};

export const authorityBoundary: RuntimeConsumerAuthority = {
  resolveRole(session) {
    return session.role ?? 'anonymous';
  },
  isAuthenticated(session) {
    return session.role !== null && session.role !== 'anonymous';
  },
};
