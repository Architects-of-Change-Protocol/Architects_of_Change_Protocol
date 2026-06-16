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
