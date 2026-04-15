export interface RssConfiguredFeed {
  id?: string;
  url: string;
  label: string;
}

export interface RssItem {
  id: string;
  title: string;
  link: string;
  pubDate: string | null;
  contentSnippet: string;
  feedUrl: string;
  feedLabel: string;
}

export async function fetchRssFeeds(): Promise<RssConfiguredFeed[]> {
  const res = await fetch("/api/rss/feeds");
  const data = (await res.json()) as { feeds?: RssConfiguredFeed[] };
  if (!res.ok) {
    const msg = typeof (data as { message?: string }).message === "string" ? (data as { message: string }).message : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return Array.isArray(data.feeds) ? data.feeds : [];
}

export async function addRssFeed(url: string, label: string): Promise<RssConfiguredFeed> {
  const res = await fetch("/api/rss/feeds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, label })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data.feed as RssConfiguredFeed;
}

export async function removeRssFeed(id: string): Promise<void> {
  const res = await fetch(`/api/rss/feeds?id=${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || `HTTP ${res.status}`);
  }
}

export async function fetchRssItems(opts?: {
  feedUrl?: string | null;
  limit?: number;
  refresh?: boolean;
}): Promise<{ items: RssItem[]; feedUrl?: string; feedLabel?: string; cached?: boolean }> {
  const params = new URLSearchParams();
  if (opts?.feedUrl) params.set("feedUrl", opts.feedUrl);
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.refresh) params.set("refresh", "1");
  const q = params.toString();
  const res = await fetch(`/api/rss/items${q ? `?${q}` : ""}`);
  const data = (await res.json()) as {
    items?: RssItem[];
    feedUrl?: string;
    feedLabel?: string;
    cached?: boolean;
    message?: string;
  };
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return {
    items: Array.isArray(data.items) ? data.items : [],
    feedUrl: data.feedUrl,
    feedLabel: data.feedLabel,
    cached: data.cached,
  };
}
