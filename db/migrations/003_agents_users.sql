CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🤖',
  type TEXT NOT NULL DEFAULT 'Sub-Agent',
  role TEXT NOT NULL DEFAULT 'Task Execution',
  status TEXT NOT NULL DEFAULT 'idle',
  current_activity TEXT NOT NULL DEFAULT 'Awaiting tasks',
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  accent_color TEXT NOT NULL DEFAULT '#0ea5e9',
  uptime NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  response_time TEXT NOT NULL DEFAULT '100ms',
  model TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE logs (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  agent_emoji TEXT,
  agent_name TEXT,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
