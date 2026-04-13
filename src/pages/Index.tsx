import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import CommandDeck from "@/components/CommandDeck";
import AgentProfiles from "@/components/AgentProfiles";
import TaskBoard from "@/components/TaskBoard";
import AILog from "@/components/AILog";
import Council from "@/components/Council";
import MeetingIntelligence from "@/components/MeetingIntelligence";
import {
  LayoutDashboard, Users, Kanban, ScrollText, MessagesSquare, CalendarCheck,
} from "lucide-react";

const tabs = [
  { id: "command", label: "Command Deck", icon: LayoutDashboard },
  { id: "agents", label: "Agents", icon: Users },
  { id: "tasks", label: "Task Board", icon: Kanban },
  { id: "log", label: "AI Log", icon: ScrollText },
  { id: "council", label: "Council", icon: MessagesSquare },
  { id: "meetings", label: "Meetings", icon: CalendarCheck },
];

const tabContent: Record<string, React.ReactNode> = {
  command: <CommandDeck />,
  agents: <AgentProfiles />,
  tasks: <TaskBoard />,
  log: <AILog />,
  council: <Council />,
  meetings: <MeetingIntelligence />,
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("command");

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-4">
      <Header />

      {/* Tab Navigation */}
      <div className="glass-card p-1.5 flex gap-1 overflow-x-auto">
        {tabs.map((tab, i) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
