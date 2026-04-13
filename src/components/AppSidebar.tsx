import {
  LayoutDashboard, Users, Kanban, ScrollText, MessagesSquare, CalendarCheck,
  ChevronLeft, Skull, Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { agents } from "@/data/mockData";

const navItems = [
  { id: "command", label: "Command Deck", icon: LayoutDashboard },
  { id: "agents", label: "Agents", icon: Users },
  { id: "tasks", label: "Task Board", icon: Kanban },
  { id: "log", label: "AI Log", icon: ScrollText },
  { id: "council", label: "Council", icon: MessagesSquare },
  { id: "meetings", label: "Meetings", icon: CalendarCheck },
];

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  const activeAgents = agents.filter((a) => a.status === "active");

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse-glow">
              <Skull className="w-5 h-5 text-primary glow-icon" />
            </div>
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-foreground tracking-tight">ApexHunter</h1>
              <p className="text-[10px] text-muted-foreground">AI Command Center</p>
            </motion.div>
          )}
          {!collapsed && (
            <button onClick={toggleSidebar} className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(item.id)}
                      tooltip={item.label}
                      className={`relative group transition-all duration-300 ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-md bg-primary/10 border border-primary/20"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                        />
                      )}
                      <item.icon className={`w-4 h-4 relative z-10 ${isActive ? "text-primary" : ""}`} />
                      {!collapsed && (
                        <span className="relative z-10 text-sm">{item.label}</span>
                      )}
                      {isActive && !collapsed && (
                        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-inner p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="w-3 h-3 text-primary" />
              <span>System Status</span>
            </div>
            {activeAgents.slice(0, 3).map((agent) => (
              <div key={agent.id} className="flex items-center gap-2 text-[11px]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full opacity-75 bg-primary" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                <span className="text-muted-foreground">{agent.emoji} {agent.name}</span>
              </div>
            ))}
          </motion.div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
