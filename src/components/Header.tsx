import { Skull, Settings } from "lucide-react";
import { agents } from "@/data/mockData";
import { motion } from "framer-motion";

const Header = () => {
  const activeAgent = agents.find((a) => a.status === "active") || agents[0];

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-l-2 border-l-primary px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl"><Skull className="w-7 h-7 text-primary" /></span>
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">ApexHunter</h1>
          <p className="text-xs text-muted-foreground">AI Agent Command Center</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <span className="text-foreground font-medium">{activeAgent.emoji} {activeAgent.name}:</span>
          <span className="text-muted-foreground">Online</span>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">Last seen: {activeAgent.lastSeen}</span>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </motion.header>
  );
};

export default Header;
