export interface Agent {
  id: string;
  name: string;
  emoji: string;
  type: string;
  role: string;
  status: "active" | "idle" | "error" | "offline";
  currentActivity: string;
  lastSeen: string;
  tasksCompleted: number;
  accuracy: number;
  skills: string[];
  accentColor: string;
  weeklyStats: number[];
  uptime: number;
  responseTime: string;
  model: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  agentEmoji: string;
  agentName: string;
  priority: "low" | "medium" | "high" | "urgent";
  progress: number;
  column: "todo" | "doing" | "needs-input" | "done";
  createdAt: string;
  dueDate: string;
  tags: string[];
  activities?: TaskActivity[];
}

// === KANBAN BOARD TYPES ===
export interface BoardColumn {
  id: string;
  name: string;
  color: string;
  position: number;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
}

export interface TaskAssignee {
  id: string;
  taskId: string;
  displayName: string;
  color: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  agentName: string;
  agentEmoji: string;
  activityType: string;
  description: string;
  createdAt: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  columnId: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  position: number;
  createdAt: string;
  subtasks: Subtask[];
  assignees: TaskAssignee[];
  tags: string[];
}

export interface LogEntry {
  id: string;
  agentEmoji: string;
  agentName: string;
  message: string;
  category: "observation" | "general" | "reminder" | "fyi" | "alert" | "success";
  timestamp: string;
  severity: "info" | "warning" | "critical";
  details?: string;
}

export interface CouncilSession {
  id: string;
  question: string;
  status: "active" | "completed" | "pending";
  participants: { emoji: string; name: string; sent: number; limit: number; status: "done" | "typing" | "waiting" }[];
  messages: { emoji: string; name: string; number: number; text: string; timestamp: string }[];
  verdict?: string;
  votesFor?: number;
  votesAgainst?: number;
}

export interface Meeting {
  id: string;
  type: "standup" | "sales" | "1-on-1" | "all-hands" | "planning" | "team" | "interview" | "external";
  title: string;
  date: string;
  duration_minutes: number;
  duration_display: string;
  attendees: string[];
  summary: string;
  action_items: { task: string; assignee: string; done: boolean }[];
  ai_insights: string;
  meeting_type: string;
  sentiment: "positive" | "neutral" | "negative";
  has_external_participants: boolean;
  external_domains: string[];
  fathom_url: string | null;
  share_url: string | null;
}

export interface Notification {
  id: string;
  type: "alert" | "info" | "success" | "warning";
  title: string;
  message: string;
  time: string;
  read: boolean;
  agentEmoji?: string;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  apiLatency: number;
  activeConnections: number;
  errorRate: number;
  throughput: number;
}

export const systemHealth: SystemHealth = {
  cpu: 0,
  memory: 0,
  network: 0,
  storage: 0,
  apiLatency: 0,
  activeConnections: 0,
  errorRate: 0,
  throughput: 0,
};

export const notifications: Notification[] = [];
export const agents: Agent[] = [];
export const tasks: Task[] = [];
export const logEntries: LogEntry[] = [];
export const councilSessions: CouncilSession[] = [];
export const meetings: Meeting[] = [];
export const activityFeed = [];

export const metricCards = [
  { label: "Tasks Completed", value: 0, trend: "0 this week", icon: "CheckCircle" as const },
  { label: "Active Agents", value: 0, trend: "0 online", icon: "Bot" as const },
  { label: "Accuracy Rate", value: 0, trend: "0 vs last week", icon: "Target" as const, suffix: "%" },
  { label: "Uptime", value: 0, trend: "30-day average", icon: "Activity" as const, suffix: "%" },
];

export const quickActions = [
  { id: "qa1", label: "Deploy Staging", icon: "Rocket", description: "Push latest build to staging" },
  { id: "qa2", label: "Run Audit", icon: "Shield", description: "Full security & compliance scan" },
  { id: "qa3", label: "Assign Tasks", icon: "ListTodo", description: "Auto-route pending tickets" },
  { id: "qa4", label: "Generate Report", icon: "FileBarChart", description: "Weekly performance report" },
  { id: "qa5", label: "Start Council", icon: "MessageCircle", description: "Begin new debate session" },
  { id: "qa6", label: "Sync Data", icon: "RefreshCw", description: "Force data pipeline sync" },
];
