CREATE TABLE task_activity (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  agent_emoji TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_task_activity_task_id ON task_activity (task_id);
