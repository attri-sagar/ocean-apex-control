CREATE TABLE board_webhooks (
  id TEXT PRIMARY KEY,
  target_url TEXT NOT NULL,
  secret_token TEXT,
  events JSONB NOT NULL DEFAULT '["task.created", "task.assigned"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
