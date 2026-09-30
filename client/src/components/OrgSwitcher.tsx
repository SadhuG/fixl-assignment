import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useOrg } from '@/context/OrgContext';
import { RoleBadge } from './Badges';
import OrgMark from './OrgMark';

// Keep the user on the same section when switching; project IDs don't carry across orgs.
function sectionOf(pathname: string) {
  if (/\/members$/.test(pathname)) return '/members';
  if (/\/projects/.test(pathname)) return '/projects';
  return '';
}

export function OrgList({ onNavigate }: { onNavigate?: () => void }) {
  const { org: active, orgs } = useOrg();
  const { pathname } = useLocation();
  const section = sectionOf(pathname);
  return (
    <div>
      <p className="px-2 pt-1 pb-1 text-micro font-medium tracking-wide text-muted-foreground uppercase">
        Your organizations
      </p>
      <ul>
        {orgs.map((o) => (
          <li key={o.id}>
            <Link
              to={`/o/${o.slug}${section}`}
              onClick={onNavigate}
              aria-current={o.id === active.id ? 'page' : undefined}
              className="flex min-h-10 items-center gap-3 rounded-control px-2 py-1.5 text-ink hover:bg-sunk"
            >
              <OrgMark org={o} size={24} />
              <span className="flex-1 truncate">{o.name}</span>
              <RoleBadge role={o.role} />
              {o.id === active.id && <Check size={16} className="text-action" aria-label="Current organization" />}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-1 border-t border-line-soft pt-1">
        <Link
          to="/orgs/new"
          onClick={onNavigate}
          className="flex min-h-10 items-center gap-3 rounded-control px-2 py-1.5 font-medium text-action hover:bg-sunk"
        >
          <Plus size={16} aria-hidden="true" /> Create organization
        </Link>
      </div>
    </div>
  );
}

// A disclosure, not an ARIA menu: Tab/Enter work normally and Esc returns focus to the button.
export default function OrgSwitcher() {
  const { org } = useOrg();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-control px-2 text-white hover:bg-white/10 focus-visible:outline-white"
        >
          <OrgMark org={org} size={24} />
          <span className="max-w-[18ch] truncate font-medium">{org.name}</span>
          <RoleBadge role={org.role} inverted />
          <ChevronDown size={16} aria-hidden="true" />
          <span className="sr-only">Switch organization</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-0 p-1 text-body">
        <OrgList onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
