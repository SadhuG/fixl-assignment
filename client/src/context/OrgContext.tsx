import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Organization, Role } from '@/api/types';

interface OrgValue {
  org: Organization;
  orgs: Organization[];
  role: Role;
  isAdmin: boolean;
}

const OrgContext = createContext<OrgValue | null>(null);

interface OrgProviderProps {
  org: Organization;
  orgs: Organization[];
  children: ReactNode;
}

export function OrgProvider({ org, orgs, children }: OrgProviderProps) {
  const value = useMemo(() => ({ org, orgs, role: org.role, isAdmin: org.role === 'ADMIN' }), [org, orgs]);
  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

// eslint-disable-next-line react/only-export-components
export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used inside <OrgProvider>');
  return ctx;
}
