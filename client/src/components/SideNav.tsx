import { NavLink } from 'react-router';
import { FolderKanban, LayoutDashboard, Users } from 'lucide-react';
import { useOrg } from '@/context/OrgContext';
import { cn } from '@/lib/utils';

const LINKS = [
  { path: '', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { path: '/projects', label: 'Projects', Icon: FolderKanban, end: false },
  { path: '/members', label: 'Members', Icon: Users, end: true },
];

interface SideNavProps {
  onNavigate?: () => void;
  rail?: boolean;
}

// `rail`: icons only between 768 and 1023 px (labels stay available to screen readers and as tooltips).
export default function SideNav({ onNavigate, rail = false }: SideNavProps) {
  const { org } = useOrg();
  return (
    <nav aria-label="Main">
      <ul className="space-y-1">
        {LINKS.map(({ path, label, Icon, end }) => (
          <li key={label}>
            <NavLink
              to={`/o/${org.slug}${path}`}
              end={end}
              onClick={onNavigate}
              title={rail ? label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex min-h-10 items-center gap-3 rounded-control px-3 font-medium',
                  rail && 'md:max-lg:justify-center md:max-lg:px-0',
                  isActive ? 'bg-org-tint text-org' : 'text-muted-foreground hover:bg-paper hover:text-ink',
                )
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span className={cn(rail && 'md:max-lg:sr-only')}>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
