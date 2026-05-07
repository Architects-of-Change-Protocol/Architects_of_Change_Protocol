import type { ScopedPermission } from './types';

export type PolicyObject = {
  id: string;
  name: string;
  description?: string;
  permission: ScopedPermission;
  active: boolean;
};
