import { useState, useEffect } from "react";
import { Search, Bell, Settings, Command, Skull, Sun, Moon, User, LogOut, Palette, HelpCircle, Shield } from "lucide-react";
import { notifications } from "@/data/mockData";
import { useAgents } from "@/contexts/AgentsContext";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { activeAgent } = useAgents();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [showNotifications, setShowNotifications] = useState(false);
  const [clock, setClock] = useState(new Date());
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = clock.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const dateStr = clock.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card relative overflow-hidden"
    >
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-gradient-x" style={{ backgroundSize: "200% 100%" }} />
      
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div className="hidden md:flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center animate-pulse-glow">
              <Skull className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight">ApexHunter</h1>
              <p className="text-[10px] text-muted-foreground">AI Agent Command Center</p>
            </div>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search agents, tasks, logs..."
              className="w-full h-8 pl-9 pr-16 rounded-lg bg-secondary/40 border border-transparent focus:border-primary/30 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-300 focus:bg-secondary/60 focus:shadow-[0_0_20px_rgba(14,165,233,0.1)]"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60 bg-secondary/60 px-1.5 py-0.5 rounded">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Clock */}
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-xs font-mono text-foreground tabular-nums">{timeStr}</span>
            <span className="text-[10px] text-muted-foreground">{dateStr}</span>
          </div>

          {/* Active agent */}
          {activeAgent && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs text-foreground font-medium">{activeAgent.emoji} {activeAgent.name}</span>
            </div>
          )}
          {!activeAgent && (
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30">
               <span className="relative flex h-2 w-2">
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground" />
               </span>
               <span className="text-xs text-muted-foreground font-medium">No active agents</span>
             </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[9px] font-bold text-foreground flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-10 w-80 glass-card p-2 z-50 max-h-96 overflow-y-auto"
                >
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Notifications</span>
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{unreadCount} new</Badge>
                  </div>
                  <div className="divider-glow my-1" />
                  {notifications.length === 0 && (
                     <div className="p-3 text-xs text-muted-foreground text-center">No notifications</div>
                  )}
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-3 rounded-lg text-xs transition-colors hover:bg-secondary/30 cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}>
                      <div className="flex items-start gap-2">
                        {n.agentEmoji && <span className="text-sm">{n.agentEmoji}</span>}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{n.title}</p>
                          <p className="text-muted-foreground mt-0.5">{n.message}</p>
                          <p className="text-muted-foreground/60 mt-1 font-mono text-[10px]">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all">
                <Settings className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card border-border">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme} className="text-xs cursor-pointer">
                {theme === "dark" ? <Sun className="w-3.5 h-3.5 mr-2" /> : <Moon className="w-3.5 h-3.5 mr-2" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs cursor-pointer">
                <Palette className="w-3.5 h-3.5 mr-2" />
                Appearance
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs cursor-pointer">
                <Bell className="w-3.5 h-3.5 mr-2" />
                Notification Preferences
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs cursor-pointer">
                <Shield className="w-3.5 h-3.5 mr-2" />
                Security & Privacy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs cursor-pointer">
                <HelpCircle className="w-3.5 h-3.5 mr-2" />
                Help & Support
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary cursor-pointer hover:border-primary/40 transition-all">
                AH
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card border-border">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-foreground">Apex Admin</p>
                  <p className="text-xs text-muted-foreground">admin@apexhunter.ai</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs cursor-pointer">
                <User className="w-3.5 h-3.5 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs cursor-pointer">
                <Settings className="w-3.5 h-3.5 mr-2" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs cursor-pointer text-destructive">
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
