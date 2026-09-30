import { ChevronDown, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useCurrentUser } from '@/context/AuthContext';
import { initialsOf } from '@/lib/initials';

export function AccountSummary() {
  const user = useCurrentUser();
  return (
    <div className="px-2 py-1.5">
      <p className="truncate font-medium text-ink">{user.name}</p>
      <p className="truncate text-small text-muted-foreground">{user.email}</p>
    </div>
  );
}

export function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button
      type="button"
      onClick={logout}
      className="flex min-h-10 w-full items-center gap-2 rounded-control px-2 text-left text-ink hover:bg-paper"
    >
      <LogOut size={16} aria-hidden="true" /> Log out
    </button>
  );
}

export default function AccountMenu() {
  const user = useCurrentUser();
  const { logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-control px-2 text-white hover:bg-white/10 focus-visible:outline-white"
        >
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-full bg-white/15 text-small font-semibold"
          >
            {initialsOf(user.name)}
          </span>
          <span className="hidden max-w-[16ch] truncate text-small lg:inline">{user.name}</span>
          <ChevronDown size={16} aria-hidden="true" />
          <span className="sr-only">Account menu</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="p-0 text-body font-normal">
          <AccountSummary />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout()}>
          <LogOut size={16} aria-hidden="true" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
