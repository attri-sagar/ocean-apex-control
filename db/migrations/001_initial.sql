-- Core Kanban / AI tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  column_id TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX idx_tasks_column_position ON tasks (column_id, position);

CREATE TABLE task_agent_meta (
  task_id TEXT PRIMARY KEY REFERENCES tasks (id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  agent_emoji TEXT NOT NULL
);

CREATE TABLE subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_subtasks_task_id ON subtasks (task_id);

CREATE TABLE assignees (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE INDEX idx_assignees_task_id ON assignees (task_id);

CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  question_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  question TEXT NOT NULL,
  related_task_id TEXT REFERENCES tasks (id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL,
  agent_emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

-- Future: intelligence / hunt reports (metadata in Postgres; large blobs → object storage)
CREATE TABLE hunt_reports (
  id TEXT PRIMARY KEY,
  title TEXT,
  summary TEXT,
  findings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  related_task_id TEXT REFERENCES tasks (id) ON DELETE SET NULL
);

CREATE INDEX idx_hunt_reports_created_at ON hunt_reports (created_at DESC);
