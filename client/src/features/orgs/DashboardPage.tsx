import { Link } from 'react-router';
import { FolderKanban, Users } from 'lucide-react';
import { RoleBadge } from '@/components/Badges';
import { useOrg } from '@/context/OrgContext';

export default function DashboardPage() {
  const { org } = useOrg();
  const cards = [
    { to: `/o/${org.slug}/projects`, label: 'Projects', body: 'Plan work and track tasks.', Icon: FolderKanban },
    { to: `/o/${org.slug}/members`, label: 'Members', body: 'See who is in this organization.', Icon: Users },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-h1 font-semibold">{org.name}</h1>
        <RoleBadge role={org.role} />
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ to, label, body, Icon }) => (
          <li key={label}>
            <Link
              to={to}
              className="flex items-start gap-3 rounded-panel border border-line bg-surface p-5 hover:border-org"
            >
              <Icon size={20} className="mt-0.5 text-org" aria-hidden="true" />
              <span>
                <span className="block font-semibold">{label}</span>
                <span className="block text-muted-foreground">{body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
