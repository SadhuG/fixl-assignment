import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import type { Member, Role } from '@/api/types';
import { RoleBadge } from '@/components/Badges';
import Banner from '@/components/Banner';
import ConfirmDialog from '@/components/ConfirmDialog';
import IconButton from '@/components/IconButton';
import InlineSelect, { type SelectOption } from '@/components/InlineSelect';
import { ErrorState, SkeletonRows } from '@/components/States';
import { useCurrentUser } from '@/context/AuthContext';
import { useOrg } from '@/context/OrgContext';
import { useChangeRole, useMembers, useRemoveMember } from '@/hooks/useMembers';
import { formatDate } from '@/lib/format';
import OrgDetailsPanel from '../orgs/OrgDetailsPanel';
import AddMemberForm from './AddMemberForm';

const ROLE_OPTIONS: SelectOption<Role>[] = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'ADMIN', label: 'Admin' },
];

export default function MembersPage() {
  const { org, isAdmin } = useOrg();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const membersQuery = useMembers(org.id);
  const changeRole = useChangeRole(org.id);
  const removeMember = useRemoveMember(org.id);
  // 409 LAST_ADMIN shows on the row whose role change caused it.
  const [rowError, setRowError] = useState<{ userId: string; message: string } | null>(null);
  const [removing, setRemoving] = useState<Member | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  function onRoleChange(member: Member, role: Role) {
    setRowError(null);
    changeRole.mutate(
      { userId: member.id, role },
      { onError: (err) => err.status === 409 && setRowError({ userId: member.id, message: err.message }) },
    );
  }

  function onConfirmRemove() {
    const target = removing;
    if (!target) return;
    removeMember.mutate(target.id, {
      onSuccess: () => {
        setRemoving(null);
        if (target.id === user.id) {
          toast.success(`You left ${org.name}`);
          navigate('/', { replace: true });
        } else {
          toast.success(`${target.name} removed`);
        }
      },
      onError: (err) => (err.status === 409 ? setRemoveError(err.message) : setRemoving(null)),
    });
  }

  let list;
  if (membersQuery.isPending) list = <SkeletonRows label="Loading members" />;
  else if (membersQuery.isError) list = <ErrorState error={membersQuery.error} onRetry={membersQuery.refetch} />;
  else {
    list = (
      <ul className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface">
        {membersQuery.data.map((m) => (
          <li key={m.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {m.name}
                {m.id === user.id && <span className="font-normal text-muted-foreground"> (you)</span>}
              </p>
              <p className="truncate text-small text-muted-foreground">{m.email}</p>
            </div>
            <p className="hidden w-36 text-small text-muted-foreground lg:block">Joined {formatDate(m.joinedAt)}</p>
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <InlineSelect<Role>
                  label={`Role of ${m.name}`}
                  value={m.role}
                  options={ROLE_OPTIONS}
                  disabled={changeRole.isPending}
                  onChange={(role) => onRoleChange(m, role)}
                />
              ) : (
                <RoleBadge role={m.role} />
              )}
              {isAdmin && (
                <IconButton
                  label={`Remove ${m.name}`}
                  tone="danger"
                  onClick={() => {
                    setRemoveError(null);
                    setRemoving(m);
                  }}
                >
                  <UserMinus size={16} aria-hidden="true" />
                </IconButton>
              )}
            </div>
            {rowError?.userId === m.id && (
              <p role="alert" className="text-small text-danger sm:basis-full">
                {rowError.message}
              </p>
            )}
          </li>
        ))}
      </ul>
    );
  }

  const removingSelf = removing?.id === user.id;

  return (
    <div className="space-y-6">
      <h1 className="text-h1 font-semibold">Members</h1>
      <OrgDetailsPanel />
      {isAdmin ? (
        <AddMemberForm orgId={org.id} />
      ) : (
        <Banner tone="info">Only admins can add members, change roles or remove people.</Banner>
      )}
      <section aria-labelledby="member-list-heading" className="space-y-3">
        <h2 id="member-list-heading" className="text-h2 font-semibold">
          People in {org.name}
        </h2>
        {list}
      </section>
      <ConfirmDialog
        open={removing !== null}
        title={removingSelf ? 'Leave organization?' : 'Remove member?'}
        body={
          removingSelf
            ? `You will lose access to ${org.name}.`
            : `${removing?.name ?? ''} will lose access to ${org.name}. Their open tasks become unassigned.`
        }
        confirmLabel={removingSelf ? 'Leave' : 'Remove'}
        loading={removeMember.isPending}
        error={removeError}
        onClose={() => setRemoving(null)}
        onConfirm={onConfirmRemove}
      />
    </div>
  );
}
