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
}

export interface Task {
  id: string;
  title: string;
  agentEmoji: string;
  agentName: string;
  priority: "low" | "medium" | "high" | "urgent";
  progress: number;
  column: "todo" | "doing" | "needs-input" | "done";
}

export interface LogEntry {
  id: string;
  agentEmoji: string;
  agentName: string;
  message: string;
  category: "observation" | "general" | "reminder" | "fyi";
  timestamp: string;
}

export interface CouncilSession {
  id: string;
  question: string;
  status: "active" | "completed" | "pending";
  participants: { emoji: string; name: string; sent: number; limit: number; status: "done" | "typing" | "waiting" }[];
  messages: { emoji: string; name: string; number: number; text: string; timestamp: string }[];
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

export const agents: Agent[] = [
  {
    id: "alpha",
    name: "Agent Alpha",
    emoji: "🤖",
    type: "Code Agent",
    role: "Lead Engineer",
    status: "active",
    currentActivity: "Refactoring API module",
    lastSeen: "Just now",
    tasksCompleted: 342,
    accuracy: 97.8,
    skills: ["TypeScript", "Python", "Code Review", "Architecture"],
    accentColor: "#0ea5e9",
  },
  {
    id: "dispatch",
    name: "Dispatch Bot",
    emoji: "📋",
    type: "Coordinator",
    role: "Operations Director",
    status: "idle",
    currentActivity: "Awaiting new assignments",
    lastSeen: "2 min ago",
    tasksCompleted: 189,
    accuracy: 95.2,
    skills: ["Task Routing", "Scheduling", "Priority Management", "Reporting"],
    accentColor: "#f59e0b",
  },
  {
    id: "audit",
    name: "Audit Bot",
    emoji: "🛡️",
    type: "Quality Agent",
    role: "Compliance Officer",
    status: "active",
    currentActivity: "Scanning PR #187",
    lastSeen: "Just now",
    tasksCompleted: 256,
    accuracy: 99.1,
    skills: ["Security Audit", "Code Quality", "Compliance", "Testing"],
    accentColor: "#06b6d4",
  },
];

export const tasks: Task[] = [
  { id: "t1", title: "Implement auth middleware", agentEmoji: "🤖", agentName: "Agent Alpha", priority: "high", progress: 0, column: "todo" },
  { id: "t2", title: "Design API rate limiter", agentEmoji: "🤖", agentName: "Agent Alpha", priority: "medium", progress: 0, column: "todo" },
  { id: "t3", title: "Migrate database schema", agentEmoji: "🤖", agentName: "Agent Alpha", priority: "urgent", progress: 65, column: "doing" },
  { id: "t4", title: "Route incident tickets", agentEmoji: "📋", agentName: "Dispatch Bot", priority: "high", progress: 40, column: "doing" },
  { id: "t5", title: "Generate weekly report", agentEmoji: "📋", agentName: "Dispatch Bot", priority: "medium", progress: 80, column: "doing" },
  { id: "t6", title: "Approve vendor access", agentEmoji: "📋", agentName: "Dispatch Bot", priority: "low", progress: 0, column: "needs-input" },
  { id: "t7", title: "Review compliance docs", agentEmoji: "🛡️", agentName: "Audit Bot", priority: "high", progress: 0, column: "needs-input" },
  { id: "t8", title: "Deploy staging build", agentEmoji: "🤖", agentName: "Agent Alpha", priority: "medium", progress: 100, column: "done" },
  { id: "t9", title: "Audit logging pipeline", agentEmoji: "🛡️", agentName: "Audit Bot", priority: "high", progress: 100, column: "done" },
  { id: "t10", title: "Onboard new service", agentEmoji: "📋", agentName: "Dispatch Bot", priority: "low", progress: 100, column: "done" },
];

export const logEntries: LogEntry[] = [
  { id: "l1", agentEmoji: "🤖", agentName: "Agent Alpha", message: "Detected unused imports in 3 files — auto-cleaned.", category: "observation", timestamp: "2026-04-13T09:45:00Z" },
  { id: "l2", agentEmoji: "📋", agentName: "Dispatch Bot", message: "All morning tasks routed. Queue clear.", category: "general", timestamp: "2026-04-13T09:30:00Z" },
  { id: "l3", agentEmoji: "🛡️", agentName: "Audit Bot", message: "PR #187 has a potential SQL injection vector in user input handler.", category: "observation", timestamp: "2026-04-13T09:15:00Z" },
  { id: "l4", agentEmoji: "🤖", agentName: "Agent Alpha", message: "Reminder: Database migration scheduled for 2 PM.", category: "reminder", timestamp: "2026-04-13T09:00:00Z" },
  { id: "l5", agentEmoji: "📋", agentName: "Dispatch Bot", message: "FYI: 3 new tickets from external clients.", category: "fyi", timestamp: "2026-04-13T08:45:00Z" },
  { id: "l6", agentEmoji: "🛡️", agentName: "Audit Bot", message: "Compliance scan complete — all systems green.", category: "general", timestamp: "2026-04-13T08:30:00Z" },
  { id: "l7", agentEmoji: "🤖", agentName: "Agent Alpha", message: "Optimized build pipeline — 23% faster CI runs.", category: "observation", timestamp: "2026-04-13T08:15:00Z" },
  { id: "l8", agentEmoji: "📋", agentName: "Dispatch Bot", message: "Reminder: Weekly sync at 11 AM.", category: "reminder", timestamp: "2026-04-13T08:00:00Z" },
  { id: "l9", agentEmoji: "🛡️", agentName: "Audit Bot", message: "FYI: New dependency added — running security check.", category: "fyi", timestamp: "2026-04-13T07:45:00Z" },
  { id: "l10", agentEmoji: "🤖", agentName: "Agent Alpha", message: "Refactored error handling in payments module.", category: "observation", timestamp: "2026-04-13T07:30:00Z" },
];

export const councilSessions: CouncilSession[] = [
  {
    id: "c1",
    question: "Should we migrate from REST to GraphQL for internal APIs?",
    status: "completed",
    participants: [
      { emoji: "🤖", name: "Agent Alpha", sent: 3, limit: 3, status: "done" },
      { emoji: "📋", name: "Dispatch Bot", sent: 2, limit: 3, status: "done" },
      { emoji: "🛡️", name: "Audit Bot", sent: 3, limit: 3, status: "done" },
    ],
    messages: [
      { emoji: "🤖", name: "Agent Alpha", number: 1, text: "GraphQL would reduce over-fetching by ~40% based on our current endpoint analysis.", timestamp: "2026-04-12T14:00:00Z" },
      { emoji: "📋", name: "Dispatch Bot", number: 1, text: "Migration would require re-routing 47 internal endpoints. Estimated 3-sprint effort.", timestamp: "2026-04-12T14:02:00Z" },
      { emoji: "🛡️", name: "Audit Bot", number: 1, text: "GraphQL introduces new attack surfaces — query depth attacks, introspection leaks. Need rate limiting.", timestamp: "2026-04-12T14:04:00Z" },
      { emoji: "🤖", name: "Agent Alpha", number: 2, text: "We could use a hybrid approach — GraphQL for reads, REST for writes. Best of both.", timestamp: "2026-04-12T14:06:00Z" },
      { emoji: "📋", name: "Dispatch Bot", number: 2, text: "Hybrid cuts migration scope by 60%. I can prioritize high-traffic read endpoints first.", timestamp: "2026-04-12T14:08:00Z" },
      { emoji: "🛡️", name: "Audit Bot", number: 2, text: "Acceptable if we enforce query complexity limits and disable introspection in production.", timestamp: "2026-04-12T14:10:00Z" },
    ],
  },
  {
    id: "c2",
    question: "What's our strategy for handling the 3x traffic spike during product launch?",
    status: "active",
    participants: [
      { emoji: "🤖", name: "Agent Alpha", sent: 2, limit: 3, status: "typing" },
      { emoji: "📋", name: "Dispatch Bot", sent: 1, limit: 3, status: "waiting" },
      { emoji: "🛡️", name: "Audit Bot", sent: 1, limit: 3, status: "done" },
    ],
    messages: [
      { emoji: "🤖", name: "Agent Alpha", number: 1, text: "I've set up auto-scaling rules. We can handle 5x current load within 90 seconds of trigger.", timestamp: "2026-04-13T10:00:00Z" },
      { emoji: "📋", name: "Dispatch Bot", number: 1, text: "I'll pre-assign incident response tasks and set up escalation chains before launch day.", timestamp: "2026-04-13T10:05:00Z" },
      { emoji: "🛡️", name: "Audit Bot", number: 1, text: "Ran load testing — identified a bottleneck in the auth service at 2.5x. Needs attention.", timestamp: "2026-04-13T10:10:00Z" },
      { emoji: "🤖", name: "Agent Alpha", number: 2, text: "Working on auth service optimization now. Adding connection pooling and caching layer.", timestamp: "2026-04-13T10:15:00Z" },
    ],
  },
];

export const meetings: Meeting[] = [
  {
    id: "m1", type: "standup", title: "Weekly Standup with Engineering", date: "2026-04-13T10:00:00Z",
    duration_minutes: 30, duration_display: "30m", attendees: ["Alice", "Bob", "Charlie"],
    summary: "Discussed sprint progress. Backend API 80% complete. Frontend team blocked on design tokens. DevOps preparing staging deploy for Wednesday.",
    action_items: [{ task: "Review PR #42", assignee: "Alice", done: false }, { task: "Update design tokens", assignee: "Bob", done: true }],
    ai_insights: "30 min meeting with 3 attendees. Key decision: prioritize API completion over new features.",
    meeting_type: "standup", sentiment: "positive", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m2", type: "standup", title: "Daily Standup — Mobile Team", date: "2026-04-12T09:00:00Z",
    duration_minutes: 15, duration_display: "15m", attendees: ["Diana", "Eve"],
    summary: "Quick sync on mobile release. iOS build passing. Android has 2 failing tests.",
    action_items: [{ task: "Fix Android test failures", assignee: "Eve", done: false }],
    ai_insights: "Short and focused. One action item identified.",
    meeting_type: "standup", sentiment: "neutral", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m3", type: "sales", title: "Enterprise Demo — Acme Corp", date: "2026-04-11T14:00:00Z",
    duration_minutes: 60, duration_display: "1h", attendees: ["Frank", "Grace", "John (Acme)"],
    summary: "Presented enterprise features. Client interested in SSO and audit logging. Requested pricing for 500-seat plan.",
    action_items: [{ task: "Send pricing proposal", assignee: "Frank", done: false }, { task: "Prepare SSO demo", assignee: "Grace", done: false }],
    ai_insights: "High-value lead. Client mentioned budget approval by Q2. Follow up within 48h.",
    meeting_type: "sales", sentiment: "positive", has_external_participants: true, external_domains: ["acme.com"], fathom_url: "https://fathom.video/demo1", share_url: null,
  },
  {
    id: "m4", type: "sales", title: "Pipeline Review — Q2 Targets", date: "2026-04-10T15:00:00Z",
    duration_minutes: 45, duration_display: "45m", attendees: ["Frank", "Hank", "Ivy"],
    summary: "Reviewed Q2 pipeline. 12 deals in negotiation, 3 expected to close this month. Total pipeline value $2.3M.",
    action_items: [{ task: "Update CRM with latest stages", assignee: "Hank", done: true }, { task: "Schedule follow-ups for stale deals", assignee: "Ivy", done: false }],
    ai_insights: "Strong pipeline. 3 deals at risk due to competitor pressure.",
    meeting_type: "sales", sentiment: "neutral", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m5", type: "interview", title: "Technical Interview — Senior Engineer", date: "2026-04-09T11:00:00Z",
    duration_minutes: 90, duration_display: "1h 30m", attendees: ["Alice", "Bob", "Candidate X"],
    summary: "Strong system design skills. Solid TypeScript knowledge. Slight gap in distributed systems. Recommend second round.",
    action_items: [{ task: "Submit interview scorecard", assignee: "Alice", done: true }, { task: "Schedule panel round", assignee: "Bob", done: false }],
    ai_insights: "Candidate scored 8/10. Strong culture fit signals detected.",
    meeting_type: "interview", sentiment: "positive", has_external_participants: true, external_domains: ["candidate.email"], fathom_url: null, share_url: null,
  },
  {
    id: "m6", type: "all-hands", title: "Company All-Hands — April", date: "2026-04-07T16:00:00Z",
    duration_minutes: 60, duration_display: "1h", attendees: ["CEO", "CTO", "All Staff"],
    summary: "Q1 results presented. Revenue up 34% YoY. New product line launching in May. Hiring 15 new roles.",
    action_items: [{ task: "Share Q1 deck with team", assignee: "CEO", done: true }],
    ai_insights: "High engagement. 47 questions submitted. Morale appears strong.",
    meeting_type: "all-hands", sentiment: "positive", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m7", type: "1-on-1", title: "1:1 — Alice & Manager", date: "2026-04-08T10:00:00Z",
    duration_minutes: 30, duration_display: "30m", attendees: ["Alice", "Manager"],
    summary: "Discussed career growth. Alice interested in tech lead role. Agreed on 90-day development plan.",
    action_items: [{ task: "Draft development plan", assignee: "Manager", done: false }, { task: "Identify mentorship opportunities", assignee: "Alice", done: false }],
    ai_insights: "Positive conversation. Employee engagement high.",
    meeting_type: "1-on-1", sentiment: "positive", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m8", type: "1-on-1", title: "1:1 — Bob & Manager", date: "2026-04-06T14:00:00Z",
    duration_minutes: 25, duration_display: "25m", attendees: ["Bob", "Manager"],
    summary: "Reviewed sprint performance. Bob feeling overloaded. Agreed to redistribute 2 tasks to Dispatch Bot.",
    action_items: [{ task: "Reassign tasks via Dispatch Bot", assignee: "Manager", done: true }],
    ai_insights: "Workload concern flagged. Action taken immediately.",
    meeting_type: "1-on-1", sentiment: "neutral", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m9", type: "planning", title: "Sprint Planning — Sprint 24", date: "2026-04-05T09:00:00Z",
    duration_minutes: 120, duration_display: "2h", attendees: ["Alice", "Bob", "Charlie", "Diana", "Eve"],
    summary: "Planned 34 story points. Focus on API completion and mobile release. 2 stretch goals added.",
    action_items: [{ task: "Create Jira tickets for stretch goals", assignee: "Charlie", done: false }, { task: "Update roadmap", assignee: "Diana", done: true }],
    ai_insights: "Velocity trending up. Team committed to 34 points vs. 28 last sprint.",
    meeting_type: "planning", sentiment: "positive", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: "m10", type: "team", title: "Design Review — New Dashboard", date: "2026-04-04T13:00:00Z",
    duration_minutes: 45, duration_display: "45m", attendees: ["Eve", "Frank", "Grace"],
    summary: "Reviewed 3 design concepts. Option B selected — dark theme with glass-morphism. Implementation starts next sprint.",
    action_items: [{ task: "Finalize design specs", assignee: "Eve", done: false }, { task: "Create component library tickets", assignee: "Grace", done: false }],
    ai_insights: "Unanimous decision on design direction. Fast alignment.",
    meeting_type: "team", sentiment: "positive", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
];

export const activityFeed = [
  { id: "a1", emoji: "🤖", text: "Agent Alpha completed API refactor", time: "2 min ago" },
  { id: "a2", emoji: "🛡️", text: "Audit Bot flagged security issue in PR #187", time: "5 min ago" },
  { id: "a3", emoji: "📋", text: "Dispatch Bot routed 3 new tickets", time: "8 min ago" },
  { id: "a4", emoji: "🤖", text: "Agent Alpha pushed optimized CI pipeline", time: "15 min ago" },
  { id: "a5", emoji: "🛡️", text: "Audit Bot completed compliance scan", time: "22 min ago" },
  { id: "a6", emoji: "📋", text: "Dispatch Bot cleared morning queue", time: "30 min ago" },
  { id: "a7", emoji: "🤖", text: "Agent Alpha cleaned unused imports", time: "45 min ago" },
  { id: "a8", emoji: "🛡️", text: "Audit Bot approved vendor access request", time: "1h ago" },
];

export const metricCards = [
  { label: "Tasks Completed", value: 787, trend: "+12%", icon: "CheckCircle" as const },
  { label: "Active Agents", value: 2, trend: "of 3", icon: "Bot" as const },
  { label: "Accuracy Rate", value: 97.4, trend: "+0.3%", icon: "Target" as const, suffix: "%" },
  { label: "Uptime", value: 99.9, trend: "30d", icon: "Activity" as const, suffix: "%" },
];
