import { useState } from "react";
import { motion } from "framer-motion";
import { logEntries } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";

const categoryStyle: Record<string, string> = {
  observation: "bg-primary/15 text-primary border-primary/30",
  general: "bg-muted text-muted-foreground border-muted-foreground/30",
  reminder: "bg-amber/15 text-amber border-amber/30",
  fyi: "bg-cyan/15 text-cyan border-cyan/30",
};

const AILog = () => {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? logEntries : logEntries.filter((e) => e.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Agent Log</h3>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 h-8 text-xs glass-card border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border/50">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="observation">Observation</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
            <SelectItem value="fyi">FYI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 flex items-start gap-3"
          >
            <span className="text-xl mt-0.5">{entry.agentEmoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">{entry.agentName}</span>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryStyle[entry.category]}`}>
                  {entry.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{entry.message}</p>
              <p className="text-xs text-muted-foreground/60 mt-1 font-mono">
                {format(parseISO(entry.timestamp), "HH:mm")}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AILog;
