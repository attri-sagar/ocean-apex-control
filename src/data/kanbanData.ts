import { BoardColumn, KanbanTask } from "./mockData";

export const boardColumns: BoardColumn[] = [
  { id: "col-todo", name: "To Do", color: "#ef4444", position: 0 },
  { id: "col-doing", name: "Doing", color: "#f59e0b", position: 1 },
  { id: "col-needs-input", name: "Needs Input", color: "#a855f7", position: 2 },
  { id: "col-done", name: "Done", color: "#22c55e", position: 3 },
  { id: "col-canceled", name: "Canceled", color: "#6b7280", position: 4 },
];

const assigneeColors = ["#0ea5e9", "#f59e0b", "#a855f7", "#ef4444", "#22c55e", "#f43f5e", "#06b6d4", "#8b5cf6"];

export const kanbanTasks: KanbanTask[] = [
  // === TO DO ===
  {
    id: "kt1", title: "Implement auth middleware", description: "Add JWT validation and role-based access control to all API endpoints. Ensure backward compatibility with existing session tokens. Include refresh token rotation and token blacklisting.", columnId: "col-todo", priority: "high", dueDate: "2026-04-15", position: 0, createdAt: "2026-04-12T08:00:00Z", tags: ["backend", "security"],
    subtasks: [
      { id: "s1", taskId: "kt1", title: "Research JWT libraries", completed: true },
      { id: "s2", taskId: "kt1", title: "Implement token validation", completed: false },
      { id: "s3", taskId: "kt1", title: "Add role-based guards", completed: false },
      { id: "s4", taskId: "kt1", title: "Write integration tests", completed: false },
    ],
    assignees: [
      { id: "a1", taskId: "kt1", displayName: "Alice Chen", color: assigneeColors[0] },
      { id: "a2", taskId: "kt1", displayName: "Bob Kim", color: assigneeColors[1] },
    ],
  },
  {
    id: "kt2", title: "Design API rate limiter", description: "Implement token bucket algorithm for API rate limiting. Support per-user and per-endpoint limits with Redis-backed state.", columnId: "col-todo", priority: "medium", dueDate: "2026-04-18", position: 1, createdAt: "2026-04-11T10:00:00Z", tags: ["backend", "performance"],
    subtasks: [
      { id: "s5", taskId: "kt2", title: "Define rate limit tiers", completed: true },
      { id: "s6", taskId: "kt2", title: "Implement token bucket", completed: false },
      { id: "s7", taskId: "kt2", title: "Add Redis integration", completed: false },
    ],
    assignees: [
      { id: "a3", taskId: "kt2", displayName: "Charlie Patel", color: assigneeColors[2] },
    ],
  },
  {
    id: "kt3", title: "Build analytics dashboard", description: "Create interactive charts for user engagement metrics using Recharts. Include daily active users, retention curves, and revenue breakdown.", columnId: "col-todo", priority: "medium", dueDate: "2026-04-20", position: 2, createdAt: "2026-04-10T09:00:00Z", tags: ["frontend", "analytics"],
    subtasks: [],
    assignees: [
      { id: "a4", taskId: "kt3", displayName: "Dana Lee", color: assigneeColors[3] },
      { id: "a5", taskId: "kt3", displayName: "Eli Torres", color: assigneeColors[4] },
      { id: "a6", taskId: "kt3", displayName: "Fiona Xu", color: assigneeColors[5] },
      { id: "a7", taskId: "kt3", displayName: "George Wu", color: assigneeColors[6] },
    ],
  },
  {
    id: "kt4", title: "Set up error monitoring", description: "Integrate Sentry for error tracking and set up alerting channels in Slack.", columnId: "col-todo", priority: "low", dueDate: null, position: 3, createdAt: "2026-04-13T07:00:00Z", tags: ["devops"],
    subtasks: [
      { id: "s8", taskId: "kt4", title: "Install Sentry SDK", completed: false },
      { id: "s9", taskId: "kt4", title: "Configure alert rules", completed: false },
    ],
    assignees: [],
  },

  // === DOING ===
  {
    id: "kt5", title: "Migrate database schema", description: "Migrate from PostgreSQL 14 to 16 with zero downtime. Run parallel writes during transition. Validate data integrity post-migration.", columnId: "col-doing", priority: "urgent", dueDate: "2026-04-14", position: 0, createdAt: "2026-04-08T11:00:00Z", tags: ["database", "migration"],
    subtasks: [
      { id: "s10", taskId: "kt5", title: "Create migration scripts", completed: true },
      { id: "s11", taskId: "kt5", title: "Test on staging", completed: true },
      { id: "s12", taskId: "kt5", title: "Run production migration", completed: false },
      { id: "s13", taskId: "kt5", title: "Validate data integrity", completed: false },
      { id: "s14", taskId: "kt5", title: "Update connection strings", completed: false },
    ],
    assignees: [
      { id: "a8", taskId: "kt5", displayName: "Alice Chen", color: assigneeColors[0] },
    ],
  },
  {
    id: "kt6", title: "Route incident tickets", description: "Auto-assign incoming tickets based on severity and team capacity. Build priority queue with SLA tracking.", columnId: "col-doing", priority: "high", dueDate: "2026-04-13", position: 1, createdAt: "2026-04-09T14:00:00Z", tags: ["ops", "automation"],
    subtasks: [
      { id: "s15", taskId: "kt6", title: "Define routing rules", completed: true },
      { id: "s16", taskId: "kt6", title: "Implement priority queue", completed: true },
      { id: "s17", taskId: "kt6", title: "Add SLA tracking", completed: false },
    ],
    assignees: [
      { id: "a9", taskId: "kt6", displayName: "Bob Kim", color: assigneeColors[1] },
      { id: "a10", taskId: "kt6", displayName: "Charlie Patel", color: assigneeColors[2] },
    ],
  },
  {
    id: "kt7", title: "Train sentiment model", description: "Fine-tune NLP model on customer feedback data. Target 95% accuracy on support ticket classification.", columnId: "col-doing", priority: "high", dueDate: "2026-04-16", position: 2, createdAt: "2026-04-07T16:00:00Z", tags: ["ml", "nlp"],
    subtasks: [
      { id: "s18", taskId: "kt7", title: "Prepare training data", completed: true },
      { id: "s19", taskId: "kt7", title: "Train v1 model", completed: true },
      { id: "s20", taskId: "kt7", title: "Evaluate accuracy", completed: false },
      { id: "s21", taskId: "kt7", title: "Deploy to staging", completed: false },
    ],
    assignees: [
      { id: "a11", taskId: "kt7", displayName: "Dana Lee", color: assigneeColors[3] },
    ],
  },
  {
    id: "kt8", title: "Generate weekly KPI report", description: "Compile KPIs, burndown charts, and team velocity metrics for leadership review.", columnId: "col-doing", priority: "medium", dueDate: "2026-04-13", position: 3, createdAt: "2026-04-10T08:00:00Z", tags: ["reporting"],
    subtasks: [],
    assignees: [
      { id: "a12", taskId: "kt8", displayName: "Eli Torres", color: assigneeColors[4] },
    ],
  },

  // === NEEDS INPUT ===
  {
    id: "kt9", title: "Approve vendor access", description: "Review and approve third-party vendor API access requests. Requires legal team sign-off on data sharing agreement.", columnId: "col-needs-input", priority: "low", dueDate: "2026-04-17", position: 0, createdAt: "2026-04-11T13:00:00Z", tags: ["ops", "security"],
    subtasks: [
      { id: "s22", taskId: "kt9", title: "Review security docs", completed: true },
      { id: "s23", taskId: "kt9", title: "Get legal approval", completed: false },
      { id: "s24", taskId: "kt9", title: "Provision API keys", completed: false },
    ],
    assignees: [
      { id: "a13", taskId: "kt9", displayName: "Fiona Xu", color: assigneeColors[5] },
    ],
  },
  {
    id: "kt10", title: "Review compliance docs", description: "SOC2 Type II compliance documentation review. External auditor needs responses by EOW.", columnId: "col-needs-input", priority: "urgent", dueDate: "2026-04-11", position: 1, createdAt: "2026-04-10T09:00:00Z", tags: ["compliance"],
    subtasks: [
      { id: "s25", taskId: "kt10", title: "Review access controls section", completed: true },
      { id: "s26", taskId: "kt10", title: "Review data handling section", completed: true },
      { id: "s27", taskId: "kt10", title: "Review incident response plan", completed: false },
      { id: "s28", taskId: "kt10", title: "Submit to auditor", completed: false },
    ],
    assignees: [
      { id: "a14", taskId: "kt10", displayName: "George Wu", color: assigneeColors[6] },
      { id: "a15", taskId: "kt10", displayName: "Alice Chen", color: assigneeColors[0] },
    ],
  },
  {
    id: "kt11", title: "Draft client newsletter", description: "Write and design Q2 product update newsletter. Awaiting content from product team.", columnId: "col-needs-input", priority: "medium", dueDate: "2026-04-19", position: 2, createdAt: "2026-04-12T07:00:00Z", tags: ["content", "marketing"],
    subtasks: [],
    assignees: [
      { id: "a16", taskId: "kt11", displayName: "Bob Kim", color: assigneeColors[1] },
    ],
  },

  // === DONE ===
  {
    id: "kt12", title: "Deploy staging build v2.4.1", description: "Deploy v2.4.1 to staging environment. All smoke tests passed. Performance metrics within acceptable range.", columnId: "col-done", priority: "medium", dueDate: "2026-04-10", position: 0, createdAt: "2026-04-06T15:00:00Z", tags: ["devops"],
    subtasks: [
      { id: "s29", taskId: "kt12", title: "Build Docker image", completed: true },
      { id: "s30", taskId: "kt12", title: "Deploy to staging", completed: true },
      { id: "s31", taskId: "kt12", title: "Run smoke tests", completed: true },
    ],
    assignees: [
      { id: "a17", taskId: "kt12", displayName: "Charlie Patel", color: assigneeColors[2] },
    ],
  },
  {
    id: "kt13", title: "Audit logging pipeline", description: "Implement structured logging with ELK stack integration. All services now emit structured JSON logs.", columnId: "col-done", priority: "high", dueDate: "2026-04-09", position: 1, createdAt: "2026-04-05T11:00:00Z", tags: ["logging", "security"],
    subtasks: [
      { id: "s32", taskId: "kt13", title: "Define log schema", completed: true },
      { id: "s33", taskId: "kt13", title: "Add log formatters", completed: true },
      { id: "s34", taskId: "kt13", title: "Configure ELK pipeline", completed: true },
      { id: "s35", taskId: "kt13", title: "Verify in production", completed: true },
    ],
    assignees: [
      { id: "a18", taskId: "kt13", displayName: "Dana Lee", color: assigneeColors[3] },
      { id: "a19", taskId: "kt13", displayName: "Eli Torres", color: assigneeColors[4] },
    ],
  },
  {
    id: "kt14", title: "Revenue forecast model", description: "Built Q2 revenue prediction using historical data. Model achieves 92% accuracy on validation set.", columnId: "col-done", priority: "high", dueDate: "2026-04-07", position: 2, createdAt: "2026-04-03T10:00:00Z", tags: ["analytics", "ml"],
    subtasks: [],
    assignees: [
      { id: "a20", taskId: "kt14", displayName: "Fiona Xu", color: assigneeColors[5] },
    ],
  },
  {
    id: "kt15", title: "Social media campaign launch", description: "Execute product launch social media blitz across 4 platforms. Reached 12.4K impressions in first 24 hours.", columnId: "col-done", priority: "medium", dueDate: "2026-04-06", position: 3, createdAt: "2026-04-02T09:00:00Z", tags: ["marketing"],
    subtasks: [
      { id: "s36", taskId: "kt15", title: "Design graphics", completed: true },
      { id: "s37", taskId: "kt15", title: "Write copy", completed: true },
      { id: "s38", taskId: "kt15", title: "Schedule posts", completed: true },
      { id: "s39", taskId: "kt15", title: "Monitor engagement", completed: true },
    ],
    assignees: [
      { id: "a21", taskId: "kt15", displayName: "George Wu", color: assigneeColors[6] },
      { id: "a22", taskId: "kt15", displayName: "Alice Chen", color: assigneeColors[0] },
      { id: "a23", taskId: "kt15", displayName: "Bob Kim", color: assigneeColors[1] },
    ],
  },

  // === CANCELED ===
  {
    id: "kt16", title: "Legacy API v1 deprecation", description: "Was going to deprecate v1 API endpoints but stakeholder feedback indicated several major clients still depend on them.", columnId: "col-canceled", priority: "low", dueDate: "2026-04-12", position: 0, createdAt: "2026-04-01T08:00:00Z", tags: ["backend", "api"],
    subtasks: [
      { id: "s40", taskId: "kt16", title: "Identify v1 consumers", completed: true },
      { id: "s41", taskId: "kt16", title: "Send deprecation notice", completed: false },
    ],
    assignees: [
      { id: "a24", taskId: "kt16", displayName: "Charlie Patel", color: assigneeColors[2] },
    ],
  },
  {
    id: "kt17", title: "Migrate to GraphQL", description: "Full GraphQL migration was canceled in favor of a hybrid REST+GraphQL approach per council decision.", columnId: "col-canceled", priority: "medium", dueDate: "2026-04-08", position: 1, createdAt: "2026-03-28T12:00:00Z", tags: ["backend", "api"],
    subtasks: [],
    assignees: [
      { id: "a25", taskId: "kt17", displayName: "Dana Lee", color: assigneeColors[3] },
      { id: "a26", taskId: "kt17", displayName: "Eli Torres", color: assigneeColors[4] },
    ],
  },
];
