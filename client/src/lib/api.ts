type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

export async function apiFetch<T>(
  path: string,
  token: string | null,
  options?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !body.ok) {
    const msg = !body.ok ? body.error : `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return body.data;
}
