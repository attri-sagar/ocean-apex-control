import { motion } from "framer-motion";
import { CheckCircle, Bot, Target, Activity, Rocket, Shield, ListTodo, FileBarChart, MessageCircle, RefreshCw, Cpu, HardDrive, Wifi, Database } from "lucide-react";
import { metricCards, activityFeed, systemHealth, quickActions } from "@/data/mockData";
import { useAgents } from "@/contexts/AgentsContext";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const iconMap: Record<string, any> = { CheckCircle, Bot, Target, Activity };
const actionIconMap: Record<string, any> = { Rocket, Shield, ListTodo, FileBarChart, MessageCircle, RefreshCw };

const CountUp = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(Number(current.toFixed(1)));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{Number.isInteger(target) ? Math.round(val) : val.toFixed(1)}{suffix}</span>;
};

const statusColor: Record<string, string> = {
  active: "bg-primary",
  idle: "bg-amber",
  error: "bg-destructive",
  offline: "bg-muted-foreground",
};

const activityTypeColor: Record<string, string> = {
  success: "border-l-emerald",
  alert: "border-l-destructive",
  info: "border-l-primary",
};

const SystemHealthBar = ({ label, value, icon: Icon }: { label: string; value: number; icon: any }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
      <span className="font-mono text-foreground">{value}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className={`h-full rounded-full ${value > 80 ? "bg-amber" : value > 90 ? "bg-destructive" : "bg-primary"}`}
        style={{
          boxShadow: `0 0 8px ${value > 80 ? "hsl(38 92% 50% / 0.4)" : "hsl(199 89% 48% / 0.4)"}`,
        }}
      />
    </div>
  </div>
);

const CommandDeck = () => {
  const { agents } = useAgents();
  return (
  <div className="space-y-5">
    {/* Metric Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((card, i) => {
        const Icon = iconMap[card.icon];
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-hover p-5 group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <Icon className="w-5 h-5 text-primary glow-icon" />
              </div>
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <div className="text-3xl font-bold font-mono text-foreground">
              <CountUp target={card.value} suffix={card.suffix} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">{card.trend}</p>
          </motion.div>
        );
      })}
    </div>

    {/* Quick Actions */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {quickActions.map((action) => {
          const Icon = actionIconMap[action.icon];
          return (
            <button
              key={action.id}
              onClick={() => toast.success(`${action.label} initiated`)}
              className="glass-card-inner p-3 flex flex-col items-center gap-2 text-center hover:bg-primary/5 hover:border-primary/20 transition-all group cursor-pointer"
            >
              <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-[11px] font-medium text-foreground">{action.label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>

    {/* Activity + Agent Status + System Health */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Activity Feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5 lg:col-span-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
        <ScrollArea className="h-72">
          <div className="space-y-1.5">
            {activityFeed.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }}
                className={`flex items-start gap-3 text-sm p-2.5 rounded-lg border-l-2 ${activityTypeColor[item.type]} hover:bg-secondary/20 transition-colors`}
              >
                <span className="text-base leading-none mt-0.5">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-xs">{item.text}</p>
                  <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Agent Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5 lg:col-span-4"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">Agent Status</h3>
        <div className="space-y-2">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl glass-card-inner hover:border-primary/10 transition-all group"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {agent.status === "active" && (
                  <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: agent.accentColor }} />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColor[agent.status]}`} />
              </span>
              <span className="text-lg">{agent.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{agent.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{agent.currentActivity}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-mono text-muted-foreground">{agent.responseTime}</p>
                <p className="text-[9px] text-muted-foreground/50">{agent.lastSeen}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-5 lg:col-span-3"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">System Health</h3>
        <div className="space-y-4">
          <SystemHealthBar label="CPU" value={systemHealth.cpu} icon={Cpu} />
          <SystemHealthBar label="Memory" value={systemHealth.memory} icon={HardDrive} />
          <SystemHealthBar label="Network" value={systemHealth.network} icon={Wifi} />
          <SystemHealthBar label="Storage" value={systemHealth.storage} icon={Database} />
        </div>
        <div className="divider-glow my-4" />
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-foreground">{systemHealth.apiLatency}ms</p>
            <p className="text-[10px] text-muted-foreground">API Latency</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-mono font-bold text-foreground">{systemHealth.errorRate}%</p>
            <p className="text-[10px] text-muted-foreground">Error Rate</p>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
  );
};

export default CommandDeck;
