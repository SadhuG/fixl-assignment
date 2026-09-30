import { useLayoutEffect, useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { useOrg } from '@/context/OrgContext';
import { orgStyle } from '@/lib/orgHue';
import AccountMenu, { AccountSummary, LogoutButton } from './AccountMenu';
import Logo from './Logo';
import Modal from './Modal';
import OrgSwitcher, { OrgList } from './OrgSwitcher';
import SideNav from './SideNav';

// Menus, sheets and dialogs render in portals under <body>, so the org hue lives on <html>.
function useOrgHue(orgSlug: string) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const vars = orgStyle({ slug: orgSlug });
    for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
    return () => {
      for (const name of Object.keys(vars)) root.style.removeProperty(name);
    };
  }, [orgSlug]);
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { org } = useOrg();
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = () => setNavOpen(false);
  useOrgHue(org.slug);

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-control bg-surface px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-org-deep px-2 text-white sm:px-4">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label="Open navigation"
          className="grid size-10 place-items-center rounded-control hover:bg-white/10 md:hidden"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <Logo inverted />
        <div className="ml-2 hidden md:block">
          <OrgSwitcher />
        </div>
        <div className="ml-auto hidden md:block">
          <AccountMenu />
        </div>
      </header>

      <div className="flex">
        {/* 72 px icon rail from 768 px, full 240 px sidebar from 1024 px (docs/ui-plan.md). */}
        <aside className="hidden min-h-[calc(100dvh-3.5rem)] shrink-0 border-r border-line bg-surface p-2 md:block md:w-[72px] lg:w-60 lg:p-3">
          <SideNav rail />
        </aside>
        {/* tabIndex -1 lets the skip link move focus here, not just scroll. */}
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 p-4 outline-none md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <Modal open={navOpen} onClose={closeNav} title="Menu" variant="left">
        <div className="space-y-4">
          <OrgList onNavigate={closeNav} />
          <div className="border-t border-line pt-3">
            <SideNav onNavigate={closeNav} />
          </div>
          <div className="border-t border-line pt-3">
            <AccountSummary />
            <LogoutButton />
          </div>
        </div>
      </Modal>
    </div>
  );
}
