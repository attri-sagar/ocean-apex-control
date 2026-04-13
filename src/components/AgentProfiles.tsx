import { motion } from "framer-motion";
import { agents } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, Activity, Settings, Play, Pause } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";

const statusLabel: Record<string, string> = {
  active: "Active",
  idle: "Idle",
  error: "Error",
  offline: "Offline",
};

const statusDotClass: Record<string, string> = {
  active: "bg-primary",
  idle: "bg-amber",
  error: "bg-destructive",
  offline: "bg-muted-foreground",
};

const AgentProfiles = () => (
  <div className="space-y-5">
    {/* Summary bar */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex flex-wrap items-center gap-6"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">Fleet Overview</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> {agents.filter(a => a.status === "active").length} Active</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber" /> {agents.filter(a => a.status === "idle").length} Idle</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" /> {agents.filter(a => a.status === "error").length} Error</span>
      </div>
      <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <span>Total Tasks: {agents.reduce((acc, a) => acc + a.tasksCompleted, 0)}</span>
        <span>|</span>
        <span>Avg Accuracy: {(agents.reduce((acc, a) => acc + a.accuracy, 0) / agents.length).toFixed(1)}%</span>
      </div>
    </motion.div>

    {/* Agent cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {agents.map((agent, i) => {
        const weekData = agent.weeklyStats.map((v, idx) => ({ day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx], tasks: v }));
        return (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-hover p-5 group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl relative"
                  style={{ background: `${agent.accentColor}15`, boxShadow: `0 0 20px ${agent.accentColor}15` }}
                >
                  {agent.emoji}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${statusDotClass[agent.status]}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{agent.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{agent.role}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] px-2"
                style={{ color: agent.accentColor, borderColor: `${agent.accentColor}40`, backgroundColor: `${agent.accentColor}10` }}
              >
                {statusLabel[agent.status]}
              </Badge>
            </div>

            {/* Model & Type */}
            <div className="flex items-center gap-2 mb-4 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-secondary/50 text-muted-foreground">{agent.type}</span>
              <span className="px-2 py-0.5 rounded-md bg-secondary/50 text-muted-foreground font-mono">{agent.model}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 rounded-xl glass-card-inner">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Zap className="w-3 h-3" />
                </div>
                <p className="text-sm font-bold font-mono text-foreground">{agent.tasksCompleted}</p>
                <p className="text-[9px] text-muted-foreground">Tasks</p>
              </div>
              <div className="text-center p-2 rounded-xl glass-card-inner">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Activity className="w-3 h-3" />
                </div>
                <p className="text-sm font-bold font-mono text-foreground">{agent.accuracy}%</p>
                <p className="text-[9px] text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center p-2 rounded-xl glass-card-inner">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Clock className="w-3 h-3" />
                </div>
                <p className="text-sm font-bold font-mono text-foreground">{agent.responseTime}</p>
                <p className="text-[9px] text-muted-foreground">Response</p>
              </div>
            </div>

            {/* Weekly sparkline */}
            <div className="mb-4">
              <p className="text-[10px] text-muted-foreground mb-2">7-Day Activity</p>
              <div className="h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekData}>
                    <Tooltip
                      contentStyle={{ background: "rgba(10,15,28,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: "#9ca3af" }}
                    />
                    <Bar dataKey="tasks" fill={agent.accentColor} radius={[2, 2, 0, 0]} opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {agent.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Uptime bar */}
            <div className="flex items-center gap-2 mb-4 text-[10px]">
              <span className="text-muted-foreground">Uptime</span>
              <div className="flex-1 h-1 rounded-full bg-secondary/50 overflow-hidden">
                <div className="h-full rounded-full bg-emerald" style={{ width: `${agent.uptime}%` }} />
              </div>
              <span className="font-mono text-foreground">{agent.uptime}%</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => toast.success(`${agent.name} configured`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground bg-secondary/30 hover:bg-secondary/50 transition-all"
              >
                <Settings className="w-3 h-3" /> Configure
              </button>
              <button
                onClick={() => toast.success(agent.status === "active" ? `${agent.name} paused` : `${agent.name} deployed`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-all"
              >
                {agent.status === "active" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {agent.status === "active" ? "Pause" : "Deploy"}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default AgentProfiles;
