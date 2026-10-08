export interface CognitoIdTokenClaims {
  sub: string;
  email?: string;
  tenant_id?: string;
  tenant_scope?: string;
  exp: number;
  [key: string]: unknown;
}

// Un jeton JWT est 3 segments base64url separes par des points ; seul le
// segment central (payload) nous interesse ici, la signature est deja
// verifiee cote serveur a chaque appel API -- on ne fait que lire les
// claims pour peupler l'UI, jamais pour autoriser quoi que ce soit.
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T {
  const payload = token.split('.')[1];
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const json = decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
  return JSON.parse(json) as T;
}

export function parseTenantScope(raw: string | undefined, fallbackTenantId: string): string[] {
  if (!raw) {
    return [fallbackTenantId];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [fallbackTenantId];
  } catch {
    return [fallbackTenantId];
  }
}
