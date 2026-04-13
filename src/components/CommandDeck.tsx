import { motion } from "framer-motion";
import { CheckCircle, Bot, Target, Activity } from "lucide-react";
import { metricCards, activityFeed, agents } from "@/data/mockData";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const iconMap = { CheckCircle, Bot, Target, Activity };

const CountUp = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
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

const CommandDeck = () => (
  <div className="space-y-6">
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
            className="glass-card p-5 hover:glow-ocean transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <div className="text-3xl font-bold font-mono text-foreground">
              <CountUp target={card.value} suffix={card.suffix} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.trend}</p>
          </motion.div>
        );
      })}
    </div>

    {/* Activity + Agent Status */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-5 lg:col-span-3"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {activityFeed.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-start gap-3 text-sm"
              >
                <span className="text-lg leading-none mt-0.5">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5 lg:col-span-2"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">Agent Status</h3>
        <div className="space-y-3">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                {agent.status === "active" && (
                  <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: agent.accentColor }} />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusColor[agent.status]}`} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{agent.emoji} {agent.name}</p>
                <p className="text-xs text-muted-foreground truncate">{agent.currentActivity}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{agent.lastSeen}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

export default CommandDeck;
