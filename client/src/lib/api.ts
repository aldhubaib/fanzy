export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const json = await res.json();

  if (!json.ok) {
    throw new Error(
      typeof json.error === "string"
        ? json.error
        : JSON.stringify(json.error),
    );
  }

  return json.data as T;
}
