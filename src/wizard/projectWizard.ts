export type PersistenceResult =
  | { status: 'success'; projectId: string }
  | { status: 'failure'; reason: string };

export async function handleActivate(
  persist: () => Promise<PersistenceResult>,
  navigate: (to: string) => void,
): Promise<void> {
  const result = await persist();
  if (result.status === 'success') {
    navigate(`/projects/${result.projectId}`);
  }
}
