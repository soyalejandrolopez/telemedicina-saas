export function extractTenantSlug(hostname: string | null): string {
  if (!hostname) return 'demo';

  // Remove port if present
  const host = hostname.split(':')[0];

  // If host is an IP or plain localhost, return demo
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'demo';
  }

  // Handle subdomain e.g. "san-rafael.medischedule.com" or "san-rafael.localhost"
  const parts = host.split('.');
  if (parts.length >= 2) {
    const sub = parts[0];
    if (sub !== 'www' && sub !== 'app' && sub !== 'api') {
      return sub;
    }
  }

  return 'demo';
}
