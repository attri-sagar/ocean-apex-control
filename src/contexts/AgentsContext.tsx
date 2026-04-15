import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchAgents } from "@/lib/agentsClient";
import type { Agent } from "@/data/mockData";

interface AgentsContextType {
  agents: Agent[];
  activeAgent: Agent | null;
  refreshAgents: () => Promise<void>;
  isLoading: boolean;
}

const AgentsContext = createContext<AgentsContextType>({
  agents: [],
  activeAgent: null,
  refreshAgents: async () => {},
  isLoading: true
});

export const useAgents = () => useContext(AgentsContext);

export function AgentsProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAgents = async () => {
    try {
      const data = await fetchAgents();
      setAgents(data);
    } catch (e) {
      console.error("Failed to load agents", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAgents();
    const interval = setInterval(refreshAgents, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const activeAgent = agents.find(a => a.id === "h1") || agents[0] || null;
  useEffect(() => {
    if (activeAgent) {
      localStorage.setItem("apex_active_agent_name", activeAgent.name);
      localStorage.setItem("apex_active_agent_emoji", activeAgent.emoji);
    }
  }, [activeAgent]);

  return (
    <AgentsContext.Provider value={{ agents, activeAgent, refreshAgents, isLoading }}>
      {children}
    </AgentsContext.Provider>
  );
}
