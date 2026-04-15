import Parser from "rss-parser";
import type { IncomingMessage } from "node:http";

export interface ConfiguredFeed {
  url: string;
  label: string;
}

export interface RssItemJson {
  id: string;
  title: string;
  link: string;
  pubDate: string | null;
  contentSnippet: string;
  feedUrl: string;
  feedLabel: string;
}

const parser = new Parser({
  timeout: 25000,
  headers: { "User-Agent": "ApexHunter-RSS/1.0 (+local dev)" },
});

type CacheEntry = { at: number; items: RssItemJson[] };
const cache = new Map<string, CacheEntry>();

export function getRssCacheTtlMs(): number {
  const raw = process.env.RSS_CACHE_TTL_MS;
  if (!raw?.trim()) return 10 * 60 * 1000;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 10 * 60 * 1000;
}

function isAllowedFeedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "feed";
  }
}

function normalizeUrlKey(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hash = "";
    return u.href;
  } catch {
    return url.trim();
  }
}

export function loadConfiguredFeeds(): ConfiguredFeed[] {
  const json = process.env.RSS_FEEDS_JSON?.trim();
  if (json) {
    try {
      const parsed = JSON.parse(json) as unknown;
      if (Array.isArray(parsed)) {
        const out: ConfiguredFeed[] = [];
        for (const row of parsed) {
          if (row && typeof row === "object" && "url" in row && typeof (row as { url: unknown }).url === "string") {
            const url = String((row as { url: string }).url).trim();
            const labelRaw = (row as { label?: unknown }).label;
            const label =
              typeof labelRaw === "string" && labelRaw.trim() ? labelRaw.trim() : hostnameFromUrl(url);
            if (isAllowedFeedUrl(url)) out.push({ url, label });
          }
        }
        if (out.length > 0) return out;
      }
    } catch {
      /* fall through */
    }
  }
  const raw = process.env.RSS_FEED_URLS ?? "";
  const urls = raw.split(",").map((s) => s.trim()).filter(Boolean);
  return urls.filter(isAllowedFeedUrl).map((url) => ({ url, label: hostnameFromUrl(url) }));
}

export function resolveAllowedFeed(feedUrl: string): ConfiguredFeed | null {
  const key = normalizeUrlKey(feedUrl);
  for (const f of loadConfiguredFeeds()) {
    if (normalizeUrlKey(f.url) === key) return f;
  }
  return null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function snippetFromItem(item: Parser.Item): string {
  const row = item as Record<string, unknown>;
  const enc = row["content:encoded"];
  const encodedStr = typeof enc === "string" ? enc : "";
  const raw = item.contentSnippet || stripHtml(String(item.content ?? encodedStr ?? ""));
  return raw.slice(0, 600);
}

function itemStableId(item: Parser.Item, feedUrl: string, index: number): string {
  if (typeof item.guid === "string" && item.guid.trim()) return item.guid.trim();
  const g = item.guid as { value?: string } | undefined;
  if (g && typeof g === "object" && typeof g.value === "string" && g.value.trim()) return g.value.trim();
  if (item.link?.trim()) return item.link.trim();
  const row = item as Record<string, unknown>;
  const id = row.id;
  if (typeof id === "string" && id.trim()) return id.trim();
  return `${feedUrl}#${index}`;
}

async function fetchFeedItems(feed: ConfiguredFeed): Promise<RssItemJson[]> {
  const parsed = await parser.parseURL(feed.url);
  const list = parsed.items ?? [];
  return list.map((item, index) => ({
    id: itemStableId(item, feed.url, index),
    title: (item.title ?? "").trim() || "(no title)",
    link: item.link?.trim() ?? "",
    pubDate: item.pubDate ?? item.isoDate ?? null,
    contentSnippet: snippetFromItem(item),
    feedUrl: feed.url,
    feedLabel: feed.label,
  }));
}

export async function getItemsForFeed(feed: ConfiguredFeed, bypassCache = false): Promise<RssItemJson[]> {
  const ttl = getRssCacheTtlMs();
  const now = Date.now();
  if (!bypassCache && ttl > 0) {
    const hit = cache.get(feed.url);
    if (hit && now - hit.at < ttl) return hit.items;
  }
  const items = await fetchFeedItems(feed);
  cache.set(feed.url, { at: now, items });
  return items;
}

function pubDateMs(pubDate: string | null): number {
  if (!pubDate) return 0;
  const t = Date.parse(pubDate);
  return Number.isNaN(t) ? 0 : t;
}

export async function getMergedItems(limit: number, bypassCache = false): Promise<RssItemJson[]> {
  const feeds = loadConfiguredFeeds();
  if (feeds.length === 0) return [];
  const batches = await Promise.all(feeds.map((f) => getItemsForFeed(f, bypassCache)));
  const merged = batches.flat();
  merged.sort((a, b) => pubDateMs(b.pubDate) - pubDateMs(a.pubDate));
  return merged.slice(0, limit);
}

export async function handleRssRequest(
  fullUrl: string,
  _req: IncomingMessage,
): Promise<{ status: number; body: Record<string, unknown> }> {
  let u: URL;
  try {
    u = new URL(fullUrl, "http://localhost");
  } catch {
    return { status: 400, body: { error: "bad_request", message: "Invalid URL" } };
  }

  if (u.pathname === "/api/rss/feeds") {
    return { status: 200, body: { feeds: loadConfiguredFeeds() } };
  }

  if (u.pathname === "/api/rss/items") {
    const feedUrl = u.searchParams.get("feedUrl");
    const refresh = u.searchParams.get("refresh") === "1" || u.searchParams.get("refresh") === "true";
    const limitRaw = u.searchParams.get("limit");
    const limit = Math.min(100, Math.max(1, Number(limitRaw) || 40));

    if (feedUrl) {
      const feed = resolveAllowedFeed(feedUrl);
      if (!feed) {
        return { status: 400, body: { error: "unknown_feed", message: "feedUrl is not in the configured allowlist" } };
      }
      const items = await getItemsForFeed(feed, refresh);
      return {
        status: 200,
        body: {
          items: items.slice(0, limit),
          feedUrl: feed.url,
          feedLabel: feed.label,
          cached: !refresh && getRssCacheTtlMs() > 0,
        },
      };
    }

    const items = await getMergedItems(limit, refresh);
    return {
      status: 200,
      body: { items, cached: !refresh && getRssCacheTtlMs() > 0 },
    };
  }

  return { status: 404, body: { error: "not_found", message: "Unknown RSS route" } };
}
