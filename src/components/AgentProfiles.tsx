import { motion } from "framer-motion";
import { agents } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

const statusLabel: Record<string, string> = {
  active: "Active",
  idle: "Idle",
  error: "Error",
  offline: "Offline",
};

const AgentProfiles = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {agents.map((agent, i) => (
      <motion.div
        key={agent.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="glass-card p-6 hover:scale-[1.02] transition-transform duration-200 group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{agent.emoji}</span>
            <div>
              <h3 className="font-semibold text-foreground">{agent.name}</h3>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-xs border-primary/30"
            style={{ color: agent.accentColor, borderColor: `${agent.accentColor}40` }}
          >
            {statusLabel[agent.status]}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="text-foreground">{agent.type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tasks Done</span>
            <span className="font-mono text-foreground">{agent.tasksCompleted}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Accuracy</span>
            <span className="font-mono text-foreground">{agent.accuracy}%</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {agent.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>
    ))}
  </div>
);

export default AgentProfiles;
