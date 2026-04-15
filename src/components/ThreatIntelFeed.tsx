import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rss, RefreshCw, Crosshair, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchRssFeeds, fetchRssItems, type RssItem } from "@/lib/rssClient";
import { createTaskApi } from "@/lib/aiTasksClient";
import type { KanbanTask } from "@/data/mockData";

const ALL_FEEDS = "__all__";

function tagSlug(label: string): string {
  const s = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return s || "feed";
}

function buildHuntDescription(item: RssItem): string {
  const lines = [
    "## Source",
    `- Feed: ${item.feedLabel}`,
    `- Published: ${item.pubDate ?? "unknown"}`,
    "",
    "## Link",
    item.link || "(no link)",
    "",
    "## Summary",
    item.contentSnippet || "(no summary)",
    "",
    "## RSS item id",
    item.id,
  ];
  return lines.join("\n");
}

interface ThreatIntelFeedProps {
  onOpenTaskBoard?: () => void;
}

export default function ThreatIntelFeed({ onOpenTaskBoard }: ThreatIntelFeedProps) {
  const [feeds, setFeeds] = useState<{ url: string; label: string }[]>([]);
  const [feedKey, setFeedKey] = useState<string>(ALL_FEEDS);
  const [items, setItems] = useState<RssItem[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<KanbanTask["priority"]>("high");
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const loadFeeds = useCallback(async () => {
    const list = await fetchRssFeeds();
    setFeeds(list);
  }, []);

  const loadItems = useCallback(
    async (refresh: boolean) => {
      setLoadState("loading");
      setError(null);
      try {
        const feedUrl = feedKey === ALL_FEEDS ? undefined : feedKey;
        const { items: next } = await fetchRssItems({ feedUrl, limit: 50, refresh });
        setItems(next);
        setLoadState("idle");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setLoadState("error");
        toast.error(msg);
      }
    },
    [feedKey],
  );

  useEffect(() => {
    loadFeeds().catch((e) => toast.error(e instanceof Error ? e.message : String(e)));
  }, [loadFeeds]);

  useEffect(() => {
    loadItems(false);
  }, [loadItems]);

  const handleAddHunt = async (item: RssItem) => {
    setCreatingId(item.id);
    try {
      const slug = tagSlug(item.feedLabel);
      await createTaskApi({
        title: item.title.slice(0, 500),
        description: buildHuntDescription(item),
        columnId: "col-todo",
        priority,
        dueDate: null,
        tags: ["rss", "threat-intel", slug],
      });
      toast.success("Threat hunt task created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create task");
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Rss className="w-5 h-5" />
            <span className="text-xs font-mono uppercase tracking-wider">Intel</span>
            {onOpenTaskBoard && (
              <Button variant="ghost" size="sm" className="h-7 text-xs ml-2" onClick={onOpenTaskBoard}>
                Task board
              </Button>
            )}
          </div>
          <h2 className="text-xl font-semibold text-foreground">Threat RSS feeds</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Read configured feeds and queue hunts on the task board for agents.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={priority} onValueChange={(v) => setPriority(v as KanbanTask["priority"])}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => loadItems(true)}
            disabled={loadState === "loading"}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadState === "loading" ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      <div className="glass-card-inner p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <span className="text-xs text-muted-foreground shrink-0">Feed</span>
        <Select
          value={feedKey}
          onValueChange={(v) => setFeedKey(v)}
          disabled={feeds.length === 0}
        >
          <SelectTrigger className="flex-1 h-9 text-sm">
            <SelectValue placeholder={feeds.length === 0 ? "No feeds configured" : "Choose feed"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FEEDS}>All feeds (merged)</SelectItem>
            {feeds.map((f) => (
              <SelectItem key={f.url} value={f.url}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {feeds.length === 0 && (
        <div className="glass-card-inner p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">No RSS feeds configured</p>
          <p>
            Set <code className="text-xs bg-secondary/80 px-1.5 py-0.5 rounded">RSS_FEED_URLS</code> or{" "}
            <code className="text-xs bg-secondary/80 px-1.5 py-0.5 rounded">RSS_FEEDS_JSON</code> in{" "}
            <code className="text-xs bg-secondary/80 px-1.5 py-0.5 rounded">.env</code> (see{" "}
            <code className="text-xs bg-secondary/80 px-1.5 py-0.5 rounded">.env.example</code>), then restart the dev server.
          </p>
        </div>
      )}

      {error && feeds.length > 0 && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {feeds.length > 0 && (
        <ScrollArea className="h-[min(70vh,720px)] pr-3">
          <div className="space-y-3 pb-2">
            {loadState === "loading" && items.length === 0 && (
              <p className="text-sm text-muted-foreground">Loading articles…</p>
            )}
            {items.map((item, i) => (
              <motion.div
                key={`${item.feedUrl}-${item.id}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="glass-card-hover p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wide">
                      <span>{item.feedLabel}</span>
                      {item.pubDate && (
                        <span className="font-mono normal-case">{new Date(item.pubDate).toLocaleString()}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-snug">{item.title}</h3>
                    {item.contentSnippet && (
                      <p className="text-xs text-muted-foreground line-clamp-4">{item.contentSnippet}</p>
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Open article <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 gap-1.5"
                    onClick={() => handleAddHunt(item)}
                    disabled={creatingId !== null}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    {creatingId === item.id ? "Creating…" : "Add hunt task"}
                  </Button>
                </div>
              </motion.div>
            ))}
            {loadState !== "loading" && items.length === 0 && feeds.length > 0 && !error && (
              <p className="text-sm text-muted-foreground">No articles returned.</p>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
