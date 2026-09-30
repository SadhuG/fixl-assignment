import type { Organization } from '@/api/types';

// From docs/ui-plan.md: base / top bar / tint. The slug picks a stable, random-looking palette hue.
export interface OrgHue {
  name: string;
  base: string;
  deep: string;
  tint: string;
}

const HUES: OrgHue[] = [
  { name: 'Indigo', base: '#2B3A8C', deep: '#1F2A6E', tint: '#E9ECF8' },
  { name: 'Umber', base: '#8A5212', deep: '#5E380B', tint: '#F7EDE1' },
  { name: 'Petrol', base: '#1F5F7A', deep: '#163F52', tint: '#E3F0F5' },
  { name: 'Plum', base: '#6B2F6B', deep: '#4B1F4B', tint: '#F3E8F3' },
  { name: 'Moss', base: '#3F6B2F', deep: '#28461D', tint: '#EAF2E4' },
  { name: 'Wine', base: '#8A2A3B', deep: '#5E1B28', tint: '#F8E6E9' },
  { name: 'Slate', base: '#3B4A5C', deep: '#2A3542', tint: '#E8ECF0' },
];

export function hueFor(org: Pick<Organization, 'slug'>): OrgHue {
  let hash = 0;
  for (const ch of org.slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return HUES[hash % HUES.length];
}

export function orgStyle(org: Pick<Organization, 'slug'>): Record<'--org' | '--org-deep' | '--org-tint', string> {
  const hue = hueFor(org);
  return { '--org': hue.base, '--org-deep': hue.deep, '--org-tint': hue.tint };
}
