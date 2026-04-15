import type { Agent } from "@/data/mockData";

export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch("/api/agents");
  if (!res.ok) throw new Error("Failed to fetch agents");
  const data = await res.json();
  return data.agents || [];
}
