// Keyed per user so a shared browser never opens someone else's last org; storage can throw in private modes.
const key = (userId: string) => `taskhive:lastOrg:${userId}`;

export function getLastOrg(userId: string): string | null {
  try {
    return localStorage.getItem(key(userId));
  } catch {
    return null;
  }
}

export function setLastOrg(userId: string, slug: string): void {
  try {
    localStorage.setItem(key(userId), slug);
  } catch {
    // Remembering the org is a convenience; ignore storage failures.
  }
}
