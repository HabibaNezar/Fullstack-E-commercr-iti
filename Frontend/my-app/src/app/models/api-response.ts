export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

/** Login/Register bodies are not fully specified in OpenAPI; token may be absent after Register. */
export interface AuthResponse {
  token?: string;
  Token?: string;
  access_token?: string;
  accessToken?: string;
  expiration?: string;
  role?: string;
  Role?: string;
}

export function normalizeAuthResponse(raw: unknown): AuthResponse {
  if (!raw || typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  const token = (o['token'] ??
    o['Token'] ??
    o['access_token'] ??
    o['accessToken']) as string | undefined;
  return {
    token,
    Token: token,
    expiration: (o['expiration'] ?? o['Expiration'] ?? o['expires_in']) as string | undefined,
    role: (o['role'] ?? o['Role']) as string | undefined,
  };
}

export function resolvedAuthToken(res: AuthResponse): string | null {
  const t = res.token ?? res.Token ?? res.access_token ?? res.accessToken;
  return t ? String(t) : null;
}