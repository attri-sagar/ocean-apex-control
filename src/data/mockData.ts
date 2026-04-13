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
  cpu: 42,
  memory: 67,
  network: 89,
  storage: 34,
  apiLatency: 23,
  activeConnections: 1247,
  errorRate: 0.02,
  throughput: 14200,
};

export const notifications: Notification[] = [
  { id: "n1", type: "alert", title: "Security Alert", message: "Audit Bot detected SQL injection vector in PR #187", time: "2 min ago", read: false, agentEmoji: "🛡️" },
  { id: "n2", type: "success", title: "Deployment Complete", message: "Staging build v2.4.1 deployed successfully", time: "15 min ago", read: false, agentEmoji: "🤖" },
  { id: "n3", type: "warning", title: "High Memory Usage", message: "Memory usage at 87% on production cluster", time: "1h ago", read: false },
  { id: "n4", type: "info", title: "New Council Session", message: "Council debate started: microservices migration strategy", time: "2h ago", read: true, agentEmoji: "💬" },
  { id: "n5", type: "success", title: "Sprint Goal Met", message: "34/34 story points completed this sprint", time: "3h ago", read: true },
  { id: "n6", type: "alert", title: "API Rate Limit", message: "External API rate limit approaching 90%", time: "4h ago", read: true },
  { id: "n7", type: "info", title: "Agent Updated", message: "Data Miner model upgraded to v3.2", time: "5h ago", read: true, agentEmoji: "📊" },
];

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
    skills: ["TypeScript", "Python", "Code Review", "Architecture", "CI/CD"],
    accentColor: "#0ea5e9",
    weeklyStats: [45, 52, 38, 61, 55, 48, 57],
    uptime: 99.97,
    responseTime: "120ms",
    model: "GPT-4 Turbo",
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
    skills: ["Task Routing", "Scheduling", "Priority Management", "Reporting", "Escalation"],
    accentColor: "#f59e0b",
    weeklyStats: [28, 31, 25, 33, 29, 35, 30],
    uptime: 99.85,
    responseTime: "85ms",
    model: "Claude 3.5",
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
    skills: ["Security Audit", "Code Quality", "Compliance", "Testing", "Vulnerability Scan"],
    accentColor: "#06b6d4",
    weeklyStats: [32, 38, 41, 35, 44, 39, 42],
    uptime: 99.99,
    responseTime: "200ms",
    model: "GPT-4o",
  },
  {
    id: "miner",
    name: "Data Miner",
    emoji: "📊",
    type: "Analytics Agent",
    role: "Data Scientist",
    status: "active",
    currentActivity: "Processing Q1 revenue data",
    lastSeen: "Just now",
    tasksCompleted: 178,
    accuracy: 96.5,
    skills: ["Data Analysis", "ML Models", "Visualization", "ETL", "Forecasting"],
    accentColor: "#8b5cf6",
    weeklyStats: [22, 28, 25, 34, 31, 27, 33],
    uptime: 99.91,
    responseTime: "340ms",
    model: "Gemini Pro",
  },
  {
    id: "comms",
    name: "Comms Agent",
    emoji: "💬",
    type: "Communication Agent",
    role: "PR & Outreach Lead",
    status: "idle",
    currentActivity: "Drafting client newsletter",
    lastSeen: "5 min ago",
    tasksCompleted: 134,
    accuracy: 93.7,
    skills: ["Content Writing", "Email Campaigns", "Social Media", "Translation", "Summarization"],
    accentColor: "#f43f5e",
    weeklyStats: [18, 22, 15, 24, 20, 19, 21],
    uptime: 99.78,
    responseTime: "95ms",
    model: "Claude 3 Opus",
  },
];

export const tasks: Task[] = [
  { id: "t1", title: "Implement auth middleware", description: "Add JWT validation and role-based access control to all API endpoints", agentEmoji: "🤖", agentName: "Agent Alpha", priority: "high", progress: 0, column: "todo", createdAt: "2026-04-12", dueDate: "2026-04-15", tags: ["backend", "security"] },
  { id: "t2", title: "Design API rate limiter", description: "Implement token bucket algorithm for API rate limiting", agentEmoji: "🤖", agentName: "Agent Alpha", priority: "medium", progress: 0, column: "todo", createdAt: "2026-04-11", dueDate: "2026-04-18", tags: ["backend", "performance"] },
  { id: "t3", title: "Build analytics dashboard", description: "Create interactive charts for user engagement metrics", agentEmoji: "📊", agentName: "Data Miner", priority: "medium", progress: 0, column: "todo", createdAt: "2026-04-10", dueDate: "2026-04-20", tags: ["frontend", "analytics"] },
  { id: "t4", title: "Migrate database schema", description: "Migrate from PostgreSQL 14 to 16 with zero downtime", agentEmoji: "🤖", agentName: "Agent Alpha", priority: "urgent", progress: 65, column: "doing", createdAt: "2026-04-08", dueDate: "2026-04-14", tags: ["database", "migration"] },
  { id: "t5", title: "Route incident tickets", description: "Auto-assign incoming tickets based on severity and team capacity", agentEmoji: "📋", agentName: "Dispatch Bot", priority: "high", progress: 40, column: "doing", createdAt: "2026-04-09", dueDate: "2026-04-13", tags: ["ops", "automation"] },
  { id: "t6", title: "Generate weekly report", description: "Compile KPIs, burndown charts, and team velocity metrics", agentEmoji: "📋", agentName: "Dispatch Bot", priority: "medium", progress: 80, column: "doing", createdAt: "2026-04-10", dueDate: "2026-04-13", tags: ["reporting"] },
  { id: "t7", title: "Train sentiment model", description: "Fine-tune NLP model on customer feedback data", agentEmoji: "📊", agentName: "Data Miner", priority: "high", progress: 55, column: "doing", createdAt: "2026-04-07", dueDate: "2026-04-16", tags: ["ml", "nlp"] },
  { id: "t8", title: "Approve vendor access", description: "Review and approve third-party vendor API access requests", agentEmoji: "📋", agentName: "Dispatch Bot", priority: "low", progress: 0, column: "needs-input", createdAt: "2026-04-11", dueDate: "2026-04-17", tags: ["ops", "security"] },
  { id: "t9", title: "Review compliance docs", description: "SOC2 Type II compliance documentation review", agentEmoji: "🛡️", agentName: "Audit Bot", priority: "high", progress: 0, column: "needs-input", createdAt: "2026-04-10", dueDate: "2026-04-15", tags: ["compliance"] },
  { id: "t10", title: "Draft client newsletter", description: "Write and design Q2 product update newsletter", agentEmoji: "💬", agentName: "Comms Agent", priority: "medium", progress: 0, column: "needs-input", createdAt: "2026-04-12", dueDate: "2026-04-19", tags: ["content", "marketing"] },
  { id: "t11", title: "Deploy staging build", description: "Deploy v2.4.1 to staging environment", agentEmoji: "🤖", agentName: "Agent Alpha", priority: "medium", progress: 100, column: "done", createdAt: "2026-04-06", dueDate: "2026-04-10", tags: ["devops"] },
  { id: "t12", title: "Audit logging pipeline", description: "Implement structured logging with ELK stack integration", agentEmoji: "🛡️", agentName: "Audit Bot", priority: "high", progress: 100, column: "done", createdAt: "2026-04-05", dueDate: "2026-04-09", tags: ["logging", "security"] },
  { id: "t13", title: "Onboard new service", description: "Set up monitoring and alerting for the new payment service", agentEmoji: "📋", agentName: "Dispatch Bot", priority: "low", progress: 100, column: "done", createdAt: "2026-04-04", dueDate: "2026-04-08", tags: ["ops"] },
  { id: "t14", title: "Revenue forecast model", description: "Build Q2 revenue prediction using historical data", agentEmoji: "📊", agentName: "Data Miner", priority: "high", progress: 100, column: "done", createdAt: "2026-04-03", dueDate: "2026-04-07", tags: ["analytics", "ml"] },
  { id: "t15", title: "Social media campaign", description: "Execute product launch social media blitz across 4 platforms", agentEmoji: "💬", agentName: "Comms Agent", priority: "medium", progress: 100, column: "done", createdAt: "2026-04-02", dueDate: "2026-04-06", tags: ["marketing"] },
];

export const logEntries: LogEntry[] = [
  { id: "l1", agentEmoji: "🤖", agentName: "Agent Alpha", message: "Detected unused imports in 3 files — auto-cleaned.", category: "observation", timestamp: "2026-04-13T09:45:00Z", severity: "info" },
  { id: "l2", agentEmoji: "📋", agentName: "Dispatch Bot", message: "All morning tasks routed. Queue clear.", category: "general", timestamp: "2026-04-13T09:30:00Z", severity: "info" },
  { id: "l3", agentEmoji: "🛡️", agentName: "Audit Bot", message: "PR #187 has a potential SQL injection vector in user input handler.", category: "alert", timestamp: "2026-04-13T09:15:00Z", severity: "critical", details: "File: src/handlers/user.ts, Line 142. Unsanitized user input passed directly to SQL query." },
  { id: "l4", agentEmoji: "🤖", agentName: "Agent Alpha", message: "Reminder: Database migration scheduled for 2 PM.", category: "reminder", timestamp: "2026-04-13T09:00:00Z", severity: "warning" },
  { id: "l5", agentEmoji: "📋", agentName: "Dispatch Bot", message: "FYI: 3 new tickets from external clients.", category: "fyi", timestamp: "2026-04-13T08:45:00Z", severity: "info" },
  { id: "l6", agentEmoji: "🛡️", agentName: "Audit Bot", message: "Compliance scan complete — all systems green.", category: "success", timestamp: "2026-04-13T08:30:00Z", severity: "info" },
  { id: "l7", agentEmoji: "🤖", agentName: "Agent Alpha", message: "Optimized build pipeline — 23% faster CI runs.", category: "observation", timestamp: "2026-04-13T08:15:00Z", severity: "info" },
  { id: "l8", agentEmoji: "📋", agentName: "Dispatch Bot", message: "Reminder: Weekly sync at 11 AM.", category: "reminder", timestamp: "2026-04-13T08:00:00Z", severity: "info" },
  { id: "l9", agentEmoji: "🛡️", agentName: "Audit Bot", message: "FYI: New dependency added — running security check.", category: "fyi", timestamp: "2026-04-13T07:45:00Z", severity: "info" },
  { id: "l10", agentEmoji: "🤖", agentName: "Agent Alpha", message: "Refactored error handling in payments module.", category: "observation", timestamp: "2026-04-13T07:30:00Z", severity: "info" },
  { id: "l11", agentEmoji: "📊", agentName: "Data Miner", message: "Revenue anomaly detected: 15% spike in enterprise tier signups.", category: "alert", timestamp: "2026-04-13T07:15:00Z", severity: "warning", details: "Compared to 30-day average. Source: Stripe webhook data." },
  { id: "l12", agentEmoji: "💬", agentName: "Comms Agent", message: "Newsletter draft ready for review — 2,400 words, 3 sections.", category: "success", timestamp: "2026-04-13T07:00:00Z", severity: "info" },
  { id: "l13", agentEmoji: "📊", agentName: "Data Miner", message: "ML model retraining complete. Accuracy: 94.2% (+1.3% from last run).", category: "success", timestamp: "2026-04-13T06:45:00Z", severity: "info" },
  { id: "l14", agentEmoji: "💬", agentName: "Comms Agent", message: "Social media reach: 12.4K impressions today (+34% vs. yesterday).", category: "observation", timestamp: "2026-04-13T06:30:00Z", severity: "info" },
  { id: "l15", agentEmoji: "🛡️", agentName: "Audit Bot", message: "Vulnerability CVE-2026-1234 patched in dependency tree.", category: "success", timestamp: "2026-04-13T06:15:00Z", severity: "info" },
];

export const councilSessions: CouncilSession[] = [
  {
    id: "c1",
    question: "Should we migrate from REST to GraphQL for internal APIs?",
    status: "completed",
    verdict: "Approved: Hybrid approach — GraphQL for reads, REST for writes",
    votesFor: 3,
    votesAgainst: 0,
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
      { emoji: "📊", name: "Data Miner", sent: 1, limit: 3, status: "waiting" },
    ],
    messages: [
      { emoji: "🤖", name: "Agent Alpha", number: 1, text: "I've set up auto-scaling rules. We can handle 5x current load within 90 seconds of trigger.", timestamp: "2026-04-13T10:00:00Z" },
      { emoji: "📋", name: "Dispatch Bot", number: 1, text: "I'll pre-assign incident response tasks and set up escalation chains before launch day.", timestamp: "2026-04-13T10:05:00Z" },
      { emoji: "🛡️", name: "Audit Bot", number: 1, text: "Ran load testing — identified a bottleneck in the auth service at 2.5x. Needs attention.", timestamp: "2026-04-13T10:10:00Z" },
      { emoji: "📊", name: "Data Miner", number: 1, text: "Historical data shows 3.2x avg spike with 4.7x peak. Recommend provisioning for 5x.", timestamp: "2026-04-13T10:12:00Z" },
      { emoji: "🤖", name: "Agent Alpha", number: 2, text: "Working on auth service optimization now. Adding connection pooling and caching layer.", timestamp: "2026-04-13T10:15:00Z" },
    ],
  },
  {
    id: "c3",
    question: "Should we adopt a microservices architecture for the billing system?",
    status: "pending",
    participants: [
      { emoji: "🤖", name: "Agent Alpha", sent: 0, limit: 3, status: "waiting" },
      { emoji: "📋", name: "Dispatch Bot", sent: 0, limit: 3, status: "waiting" },
      { emoji: "🛡️", name: "Audit Bot", sent: 0, limit: 3, status: "waiting" },
      { emoji: "📊", name: "Data Miner", sent: 0, limit: 3, status: "waiting" },
      { emoji: "💬", name: "Comms Agent", sent: 0, limit: 3, status: "waiting" },
    ],
    messages: [],
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
  {
    id: "m11", type: "external", title: "Partner Integration Call — Stripe", date: "2026-04-03T11:00:00Z",
    duration_minutes: 45, duration_display: "45m", attendees: ["Alice", "Frank", "Stripe PM"],
    summary: "Discussed webhook reliability improvements. Stripe offering beta access to new billing API. 2-week integration timeline.",
    action_items: [{ task: "Request Stripe beta API access", assignee: "Alice", done: false }, { task: "Draft integration plan", assignee: "Frank", done: false }],
    ai_insights: "Strategic partnership opportunity. New billing API could reduce integration code by 40%.",
    meeting_type: "external", sentiment: "positive", has_external_participants: true, external_domains: ["stripe.com"], fathom_url: null, share_url: "https://share.example.com/m11",
  },
  {
    id: "m12", type: "team", title: "Incident Post-Mortem — API Outage", date: "2026-04-02T15:00:00Z",
    duration_minutes: 60, duration_display: "1h", attendees: ["Alice", "Bob", "Charlie", "CTO"],
    summary: "Root cause: cascading failure from unhandled timeout in payment service. Implemented circuit breaker pattern. New alerting rules added.",
    action_items: [{ task: "Implement circuit breakers on all services", assignee: "Alice", done: true }, { task: "Add timeout handling to payment service", assignee: "Bob", done: false }, { task: "Create runbook for API outages", assignee: "Charlie", done: false }],
    ai_insights: "3 action items generated. Downtime: 23 minutes. Customer impact: 1,200 users. Blameless culture observed.",
    meeting_type: "team", sentiment: "negative", has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
];

export const activityFeed = [
  { id: "a1", emoji: "🤖", text: "Agent Alpha completed API refactor", time: "2 min ago", type: "success" as const },
  { id: "a2", emoji: "🛡️", text: "Audit Bot flagged security issue in PR #187", time: "5 min ago", type: "alert" as const },
  { id: "a3", emoji: "📋", text: "Dispatch Bot routed 3 new tickets", time: "8 min ago", type: "info" as const },
  { id: "a4", emoji: "📊", text: "Data Miner completed revenue analysis", time: "12 min ago", type: "success" as const },
  { id: "a5", emoji: "🤖", text: "Agent Alpha pushed optimized CI pipeline", time: "15 min ago", type: "info" as const },
  { id: "a6", emoji: "💬", text: "Comms Agent drafted Q2 newsletter", time: "18 min ago", type: "info" as const },
  { id: "a7", emoji: "🛡️", text: "Audit Bot completed compliance scan", time: "22 min ago", type: "success" as const },
  { id: "a8", emoji: "📋", text: "Dispatch Bot cleared morning queue", time: "30 min ago", type: "info" as const },
  { id: "a9", emoji: "🤖", text: "Agent Alpha cleaned unused imports in 3 files", time: "45 min ago", type: "info" as const },
  { id: "a10", emoji: "📊", text: "Data Miner retrained ML model — accuracy 94.2%", time: "1h ago", type: "success" as const },
  { id: "a11", emoji: "🛡️", text: "Audit Bot approved vendor access request", time: "1h ago", type: "info" as const },
  { id: "a12", emoji: "💬", text: "Comms Agent posted on 4 social channels", time: "2h ago", type: "info" as const },
];

export const metricCards = [
  { label: "Tasks Completed", value: 1099, trend: "+12% this week", icon: "CheckCircle" as const },
  { label: "Active Agents", value: 3, trend: "of 5 online", icon: "Bot" as const },
  { label: "Accuracy Rate", value: 96.5, trend: "+0.3% vs last week", icon: "Target" as const, suffix: "%" },
  { label: "Uptime", value: 99.9, trend: "30-day average", icon: "Activity" as const, suffix: "%" },
];

export const quickActions = [
  { id: "qa1", label: "Deploy Staging", icon: "Rocket", description: "Push latest build to staging" },
  { id: "qa2", label: "Run Audit", icon: "Shield", description: "Full security & compliance scan" },
  { id: "qa3", label: "Assign Tasks", icon: "ListTodo", description: "Auto-route pending tickets" },
  { id: "qa4", label: "Generate Report", icon: "FileBarChart", description: "Weekly performance report" },
  { id: "qa5", label: "Start Council", icon: "MessageCircle", description: "Begin new debate session" },
  { id: "qa6", label: "Sync Data", icon: "RefreshCw", description: "Force data pipeline sync" },
];
