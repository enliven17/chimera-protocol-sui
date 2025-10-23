// Minimal HyperSync HTTP client (generic POST wrapper)
// Reads a HyperSync endpoint from env or passed argument and performs a JSON POST

export type HyperSyncQuery = Record<string, unknown>;

export async function queryHyperSync(endpoint: string, query: HyperSyncQuery): Promise<any> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HyperSync request failed: ${res.status} ${body}`);
  }
  return res.json();
}

export function getHyperSyncEndpoint(): string {
  const url = process.env.HYPERSYNC_URL;
  if (!url) throw new Error("HYPERSYNC_URL is not set");
  return url;
}

