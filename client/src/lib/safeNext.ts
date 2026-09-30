// Only same-app paths: blocks "//evil.com" and "/\evil.com" open redirects.
export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/app';
  return value;
}
