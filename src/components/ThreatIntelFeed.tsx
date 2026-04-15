import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rss, RefreshCw, Crosshair, ExternalLink, Settings, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchRssFeeds, fetchRssItems, addRssFeed, removeRssFeed, type RssItem, type RssConfiguredFeed } from "@/lib/rssClient";
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
  const [feeds, setFeeds] = useState<RssConfiguredFeed[]>([]);
  const [feedKey, setFeedKey] = useState<string>(ALL_FEEDS);
  const [items, setItems] = useState<RssItem[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<KanbanTask["priority"]>("high");
  const [creatingId, setCreatingId] = useState<string | null>(null);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");

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

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    try {
      await addRssFeed(newUrl.trim(), newLabel.trim());
      toast.success("Feed added");
      setNewUrl("");
      setNewLabel("");
      await loadFeeds();
      loadItems(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to add feed");
    }
  };

  const handleDeleteFeed = async (id: string) => {
    try {
      await removeRssFeed(id);
      toast.success("Feed removed");
      await loadFeeds();
      loadItems(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove feed");
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

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-border/50">
              <DialogHeader>
                <DialogTitle>RSS Feed Settings</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <form onSubmit={handleAddFeed} className="flex flex-col gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Feed URL</Label>
                    <Input 
                      placeholder="https://example.com/feed.xml" 
                      value={newUrl} 
                      onChange={(e) => setNewUrl(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Label (optional)</Label>
                    <Input 
                      placeholder="e.g. Krebs" 
                      value={newLabel} 
                      onChange={(e) => setNewLabel(e.target.value)} 
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2">
                    <Plus className="w-4 h-4" /> Add Feed
                  </Button>
                </form>

                <div className="mt-6">
                  <Label className="text-xs text-muted-foreground mb-2 block">Configured Feeds</Label>
                  <ScrollArea className="h-48 rounded-md border border-border/50">
                    {feeds.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No feeds configured.</div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {feeds.map((f) => (
                          <div key={f.url} className="flex items-center justify-between p-3 gap-2 hover:bg-white/5 transition-colors">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">{f.label}</p>
                              <p className="text-xs text-muted-foreground truncate" title={f.url}>{f.url}</p>
                            </div>
                            {f.id ? (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/20" onClick={() => handleDeleteFeed(f.id!)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground uppercase px-2 py-1 bg-white/5 rounded-sm">.env</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
          <p>Click the <strong>Settings</strong> button above to add an RSS feed URL.</p>
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
