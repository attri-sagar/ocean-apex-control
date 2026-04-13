import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { meetings } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar, TrendingUp, CheckSquare, Clock, Search,
  Globe, Sparkles, ChevronDown, ExternalLink, Share2,
  ThumbsUp, ThumbsDown, Minus, Users,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format, parseISO, isAfter, subDays } from "date-fns";

const typeColors: Record<string, string> = {
  standup: "#818cf8",
  sales: "#34d399",
  "1-on-1": "#60a5fa",
  "all-hands": "#fb923c",
  planning: "#2dd4bf",
  team: "#a78bfa",
  interview: "#f472b6",
  external: "#f59e0b",
};

const sentimentIcon: Record<string, any> = { positive: ThumbsUp, neutral: Minus, negative: ThumbsDown };
const sentimentColor: Record<string, string> = { positive: "text-emerald", neutral: "text-muted-foreground", negative: "text-destructive" };

const typeBadgeStyle = (type: string) => ({
  backgroundColor: `${typeColors[type] || "#6b7280"}15`,
  color: typeColors[type] || "#6b7280",
  borderColor: `${typeColors[type] || "#6b7280"}30`,
});

const MeetingIntelligence = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sort, setSort] = useState("recent");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalMeetings = meetings.length;
  const thisWeekMeetings = meetings.filter((m) => isAfter(parseISO(m.date), subDays(new Date(), 7))).length;
  const openActionItems = meetings.reduce((acc, m) => acc + m.action_items.filter((a) => !a.done).length, 0);
  const avgDuration = Math.round(meetings.reduce((acc, m) => acc + m.duration_minutes, 0) / meetings.length);
  const totalAttendees = [...new Set(meetings.flatMap((m) => m.attendees))].length;

  const filtered = useMemo(() => {
    let result = [...meetings];
    if (search) result = result.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== "all") result = result.filter((m) => m.type === typeFilter);
    if (dateRange !== "all") {
      const days = parseInt(dateRange);
      result = result.filter((m) => isAfter(parseISO(m.date), subDays(new Date(), days)));
    }
    if (sort === "recent") result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    else if (sort === "oldest") result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    else if (sort === "longest") result.sort((a, b) => b.duration_minutes - a.duration_minutes);
    return result;
  }, [search, typeFilter, dateRange, sort]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    meetings.forEach((m) => { counts[m.type] = (counts[m.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, []);

  const barData = useMemo(() => {
    const months: Record<string, number> = {};
    meetings.forEach((m) => {
      const month = format(parseISO(m.date), "MMM");
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  }, []);

  const kpis = [
    { label: "Total Meetings", value: totalMeetings, icon: Calendar },
    { label: "This Week", value: thisWeekMeetings, icon: TrendingUp },
    { label: "Open Actions", value: openActionItems, icon: CheckSquare },
    { label: "Avg Duration", value: `${avgDuration}m`, icon: Clock },
  ];

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card-hover p-5 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors"><kpi.icon className="w-5 h-5 text-primary glow-icon" /></div>
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <div className="text-3xl font-bold font-mono text-foreground">{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Meeting Types</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={typeColors[entry.name] || "#6b7280"} />
                ))}
              </Pie>
              <Legend formatter={(value: string) => <span className="text-xs text-muted-foreground capitalize">{value}</span>} />
              <Tooltip contentStyle={{ background: "rgba(10,15,28,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 11, backdropFilter: "blur(8px)" }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(10,15,28,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 11 }} />
              <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 glass-card border-border/50 text-sm focus:border-primary/30 focus:shadow-[0_0_15px_rgba(14,165,233,0.1)]"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32 h-9 text-xs glass-card border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-card border-border/50">
            <SelectItem value="all">All Types</SelectItem>
            {Object.keys(typeColors).map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-28 h-9 text-xs glass-card border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-card border-border/50">
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-36 h-9 text-xs glass-card border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-card border-border/50">
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="longest">Longest</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-[10px] text-muted-foreground font-mono">{filtered.length} results</div>
      </motion.div>

      {/* Meeting Feed */}
      <ScrollArea className="h-[520px]">
        <div className="space-y-2 pr-2">
          {filtered.map((meeting, i) => {
            const SentimentIcon = sentimentIcon[meeting.sentiment];
            return (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card-hover overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expandedId === meeting.id ? null : meeting.id)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  <Badge variant="outline" className="text-[10px] px-2 shrink-0 capitalize" style={typeBadgeStyle(meeting.type)}>
                    {meeting.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{format(parseISO(meeting.date), "MMM d, yyyy · HH:mm")} · {meeting.duration_display}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <SentimentIcon className={`w-3.5 h-3.5 ${sentimentColor[meeting.sentiment]}`} />
                    <div className="flex -space-x-2">
                      {meeting.attendees.slice(0, 3).map((a) => (
                        <div key={a} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-medium text-foreground border border-background">
                          {a[0]}
                        </div>
                      ))}
                      {meeting.attendees.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-mono text-muted-foreground border border-background">
                          +{meeting.attendees.length - 3}
                        </div>
                      )}
                    </div>
                    {meeting.has_external_participants && <Globe className="w-3.5 h-3.5 text-amber" />}
                    {meeting.action_items.filter((a) => !a.done).length > 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 border-amber/30 text-amber bg-amber/10">
                        {meeting.action_items.filter((a) => !a.done).length}
                      </Badge>
                    )}
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === meeting.id ? "rotate-180" : ""}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === meeting.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">{meeting.summary}</p>

                        {meeting.action_items.length > 0 && (
                          <div>
                            <h4 className="text-[11px] font-semibold text-foreground mb-2">Action Items</h4>
                            <div className="space-y-1.5">
                              {meeting.action_items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs p-2 rounded-lg glass-card-inner">
                                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${item.done ? "bg-primary/20 border border-primary/40 text-primary" : "border border-border/50"}`}>
                                    {item.done && "✓"}
                                  </span>
                                  <span className={`flex-1 ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.task}</span>
                                  <span className="text-muted-foreground/60 font-mono text-[10px]">→ {item.assignee}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Attendees */}
                        <div>
                          <h4 className="text-[11px] font-semibold text-foreground mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> Attendees</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {meeting.attendees.map((a) => (
                              <span key={a} className="text-[10px] px-2 py-1 rounded-lg glass-card-inner text-muted-foreground">{a}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50">
                          <Sparkles className="w-3.5 h-3.5 text-primary/50" />
                          <span>{meeting.ai_insights}</span>
                        </div>

                        <div className="flex gap-2">
                          <button className="text-[11px] px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1.5">
                            <ExternalLink className="w-3 h-3" /> Open Recording
                          </button>
                          <button className="text-[11px] px-3 py-1.5 rounded-lg glass-card-inner text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                            <Share2 className="w-3 h-3" /> Share
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MeetingIntelligence;
