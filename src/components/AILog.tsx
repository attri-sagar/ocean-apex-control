import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logEntries, LogEntry } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { ChevronDown, Download, RefreshCw, AlertTriangle, CheckCircle2, Info, Bell } from "lucide-react";
import { toast } from "sonner";

const categoryStyle: Record<string, string> = {
  observation: "bg-primary/15 text-primary border-primary/30",
  general: "bg-muted text-muted-foreground border-muted-foreground/30",
  reminder: "bg-amber/15 text-amber border-amber/30",
  fyi: "bg-cyan/15 text-cyan border-cyan/30",
  alert: "bg-destructive/15 text-destructive border-destructive/30",
  success: "bg-emerald/15 text-emerald border-emerald/30",
};

const categoryIcon: Record<string, any> = {
  observation: Info,
  general: Info,
  reminder: Bell,
  fyi: Info,
  alert: AlertTriangle,
  success: CheckCircle2,
};

const severityBorder: Record<string, string> = {
  info: "border-l-primary/30",
  warning: "border-l-amber",
  critical: "border-l-destructive",
};

const AILog = () => {
  const [filter, setFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const agents = [...new Set(logEntries.map((e) => e.agentName))];
  let filtered = filter === "all" ? logEntries : logEntries.filter((e) => e.category === filter);
  if (agentFilter !== "all") filtered = filtered.filter((e) => e.agentName === agentFilter);

  const categoryCounts = logEntries.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 flex flex-wrap items-center gap-4">
        <span className="text-sm font-semibold text-foreground">Agent Log</span>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <span key={cat} className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryStyle[cat]} capitalize`}>
              {cat}: {count}
            </span>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => toast.info("Auto-refresh enabled")} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => toast.success("Logs exported")} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 h-8 text-xs glass-card border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-card border-border/50">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="fyi">FYI</SelectItem>
            <SelectItem value="alert">Alert</SelectItem>
            <SelectItem value="success">Success</SelectItem>
          </SelectContent>
        </Select>
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-40 h-8 text-xs glass-card border-border/50"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-card border-border/50">
            <SelectItem value="all">All Agents</SelectItem>
            {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Log entries */}
      <div className="space-y-1.5">
        {filtered.map((entry, i) => {
          const CatIcon = categoryIcon[entry.category] || Info;
          const isExpanded = expandedId === entry.id;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass-card overflow-hidden border-l-2 ${severityBorder[entry.severity]}`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                className="w-full p-3.5 flex items-start gap-3 text-left"
              >
                <span className="text-lg mt-0.5">{entry.agentEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-medium text-foreground">{entry.agentName}</span>
                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${categoryStyle[entry.category]}`}>
                      <CatIcon className="w-2.5 h-2.5 mr-0.5" />
                      {entry.category}
                    </Badge>
                    {entry.severity === "critical" && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-destructive/15 text-destructive border-destructive/30 animate-pulse-dot">
                        CRITICAL
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{entry.message}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1 font-mono">
                    {format(parseISO(entry.timestamp), "HH:mm:ss")}
                  </p>
                </div>
                {entry.details && (
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && entry.details && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 border-t border-border/30 pt-3">
                      <pre className="text-[11px] text-muted-foreground font-mono whitespace-pre-wrap bg-secondary/30 p-3 rounded-lg">{entry.details}</pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AILog;
