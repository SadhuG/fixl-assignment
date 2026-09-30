import type { Organization } from '@/api/types';
import { hueFor } from '@/lib/orgHue';

interface OrgMarkProps {
  org: Pick<Organization, 'slug' | 'name'>;
  size?: number;
}

export default function OrgMark({ org, size = 28 }: OrgMarkProps) {
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-control font-semibold text-white"
      style={{ width: size, height: size, background: hueFor(org).base, fontSize: size * 0.45 }}
    >
      {org.name.trim().charAt(0).toUpperCase() || '#'}
    </span>
  );
}
