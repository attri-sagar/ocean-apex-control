import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import CommandDeck from "@/components/CommandDeck";
import AgentProfiles from "@/components/AgentProfiles";
import TaskBoard from "@/components/TaskBoard";
import AILog from "@/components/AILog";
import Council from "@/components/Council";
import MeetingIntelligence from "@/components/MeetingIntelligence";

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative">
        {/* Aurora background */}
        <div className="aurora-bg" />
        <div className="grid-overlay" />

        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 flex flex-col min-h-screen relative z-10">
          <div className="p-3">
            <Header />
          </div>

          {/* Tab Content */}
          <main className="flex-1 px-4 pb-4 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Footer */}
          <footer className="px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground/50 font-mono">
            <span>ApexHunter v2.4.1</span>
            <span>All systems operational</span>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
