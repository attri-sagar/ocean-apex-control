import type { KanbanTask, Subtask, TaskAssignee, TaskActivity } from "../src/data/mockData.ts";
import type { Pool, PoolClient } from "pg";
import { getPool } from "./db/pool.ts";

export async function nextPositionForColumn(client: Pool | PoolClient, columnId: string): Promise<number> {
  const r = await client.query<{ m: string | null }>(
    `SELECT (COALESCE(MAX(position), -1) + 1)::text AS m FROM tasks WHERE column_id = $1`,
    [columnId],
  );
  return Number(r.rows[0]?.m ?? 0);
}

function rowToTask(
  row: {
    id: string;
    title: string;
    description: string;
    column_id: string;
    priority: string;
    due_date: string | null;
    position: string | number;
    created_at: Date | string;
    tags: unknown;
  },
  subtasks: Subtask[],
  assignees: TaskAssignee[],
  activities: TaskActivity[] = [],
): KanbanTask {
  const createdAt =
    row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at);
  const tags = Array.isArray(row.tags) ? (row.tags as string[]) : [];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    columnId: row.column_id,
    priority: row.priority as KanbanTask["priority"],
    dueDate: row.due_date,
    position: typeof row.position === "number" ? row.position : Number(row.position),
    createdAt,
    subtasks,
    assignees,
    tags,
    activities,
  };
}

export async function loadAgentMetaBatch(
  taskIds: string[],
): Promise<Map<string, { agent_name: string; agent_emoji: string }>> {
  const map = new Map<string, { agent_name: string; agent_emoji: string }>();
  if (taskIds.length === 0) return map;
  const pool = getPool();
  const r = await pool.query(
    `SELECT task_id, agent_name, agent_emoji FROM task_agent_meta WHERE task_id = ANY($1::text[])`,
    [taskIds],
  );
  for (const row of r.rows) {
    map.set(String(row.task_id), {
      agent_name: String(row.agent_name),
      agent_emoji: String(row.agent_emoji),
    });
  }
  return map;
}

async function loadTaskBundle(client: Pool | PoolClient, taskId: string): Promise<KanbanTask | null> {
  const tr = await client.query(
    `SELECT id, title, description, column_id, priority, due_date, position, created_at, tags
     FROM tasks WHERE id = $1`,
    [taskId],
  );
  if (tr.rows.length === 0) return null;
  const row = tr.rows[0] as Record<string, unknown>;

  const [subs, asg, acts] = await Promise.all([
    client.query(
      `SELECT id, task_id, title, completed FROM subtasks WHERE task_id = $1 ORDER BY id`,
      [taskId],
    ),
    client.query(
      `SELECT id, task_id, display_name, color FROM assignees WHERE task_id = $1 ORDER BY id`,
      [taskId],
    ),
    client.query(`SELECT id, task_id, agent_name, agent_emoji, activity_type, description, created_at FROM task_activity WHERE task_id = $1 ORDER BY created_at DESC`, [taskId])
  ]);

  const subtasks: Subtask[] = subs.rows.map((s) => ({
    id: String(s.id),
    taskId: String(s.task_id),
    title: String(s.title),
    completed: Boolean(s.completed),
  }));
  const activities: TaskActivity[] = acts.rows.map((a) => ({
    id: String(a.id),
    taskId: String(a.task_id),
    agentName: String(a.agent_name),
    agentEmoji: String(a.agent_emoji),
    activityType: String(a.activity_type),
    description: String(a.description),
    createdAt: (a.created_at instanceof Date ? a.created_at.toISOString() : String(a.created_at))
  }));
  const assignees: TaskAssignee[] = asg.rows.map((a) => ({
    id: String(a.id),
    taskId: String(a.task_id),
    displayName: String(a.display_name ?? ""),
    color: String(a.color),
  }));

  return rowToTask(
    {
      id: String(row.id),
      title: String(row.title),
      description: String(row.description ?? ""),
      column_id: String(row.column_id),
      priority: String(row.priority),
      due_date: row.due_date === null || row.due_date === undefined ? null : String(row.due_date),
      position: row.position as number | string,
      created_at: row.created_at as Date | string,
      tags: row.tags,
    },
    subtasks,
    assignees,
    activities
  );
}

export async function logActivity(pool: any, taskId: string, agent_name: string, agent_emoji: string, activity_type: string, description: string) {
  const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await pool.query(
    'INSERT INTO task_activity (id, task_id, agent_name, agent_emoji, activity_type, description) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, taskId, agent_name, agent_emoji, activity_type, description]
  );
}

export async function findTask(taskId: string): Promise<KanbanTask | null> {
  const pool = getPool();
  return loadTaskBundle(pool, taskId);
}

export async function listTasks(columnId: string | null): Promise<KanbanTask[]> {
  const pool = getPool();
  const tr = await pool.query(
    columnId
      ? `SELECT id, title, description, column_id, priority, due_date, position, created_at, tags
         FROM tasks WHERE column_id = $1 ORDER BY position`
      : `SELECT id, title, description, column_id, priority, due_date, position, created_at, tags
         FROM tasks ORDER BY column_id, position`,
    columnId ? [columnId] : ([] as string[]),
  );
  if (tr.rows.length === 0) return [];

  const ids = tr.rows.map((r) => String((r as { id: string }).id));
  const [subs, asg, acts] = await Promise.all([
    pool.query(
      `SELECT id, task_id, title, completed FROM subtasks WHERE task_id = ANY($1::text[]) ORDER BY task_id, id`,
      [ids],
    ),
    pool.query(
      `SELECT id, task_id, display_name, color FROM assignees WHERE task_id = ANY($1::text[]) ORDER BY task_id, id`,
      [ids],
    ),
    pool.query(`SELECT id, task_id, agent_name, agent_emoji, activity_type, description, created_at FROM task_activity WHERE task_id = ANY($1::text[]) ORDER BY created_at DESC`, [ids])
  ]);

  const subsByTask = new Map<string, Subtask[]>();
  for (const s of subs.rows) {
    const tid = String(s.task_id);
    const list = subsByTask.get(tid) ?? [];
    list.push({
      id: String(s.id),
      taskId: tid,
      title: String(s.title),
      completed: Boolean(s.completed),
    });
    subsByTask.set(tid, list);
  }
  const actsByTask = new Map<string, TaskActivity[]>();
  for (const a of acts.rows) {
    const tid = String(a.task_id);
    const list = actsByTask.get(tid) ?? [];
    list.push({
      id: String(a.id),
      taskId: tid,
      agentName: String(a.agent_name),
      agentEmoji: String(a.agent_emoji),
      activityType: String(a.activity_type),
      description: String(a.description),
      createdAt: (a.created_at instanceof Date ? a.created_at.toISOString() : String(a.created_at))
    });
    actsByTask.set(tid, list);
  }
  const asgByTask = new Map<string, TaskAssignee[]>();
  for (const a of asg.rows) {
    const tid = String(a.task_id);
    const list = asgByTask.get(tid) ?? [];
    list.push({
      id: String(a.id),
      taskId: tid,
      displayName: String(a.display_name ?? ""),
      color: String(a.color),
    });
    asgByTask.set(tid, list);
  }

  return tr.rows.map((raw) => {
    const row = raw as Record<string, unknown>;
    const id = String(row.id);
    return rowToTask(
      {
        id,
        title: String(row.title),
        description: String(row.description ?? ""),
        column_id: String(row.column_id),
        priority: String(row.priority),
        due_date: row.due_date === null || row.due_date === undefined ? null : String(row.due_date),
        position: row.position as number | string,
        created_at: row.created_at as Date | string,
        tags: row.tags,
      },
      subsByTask.get(id) ?? [],
      asgByTask.get(id) ?? [],
      actsByTask.get(id) ?? [],
    );
  });
}

export async function createTask(params: {
  id: string;
  title: string;
  description: string;
  columnId: string;
  priority: KanbanTask["priority"];
  dueDate: string | null;
  position: number;
  createdAt: string;
  agent_name: string;
  agent_emoji: string;
  tags?: string[];
}): Promise<KanbanTask> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO tasks (id, title, description, column_id, priority, due_date, position, created_at, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz, $9::jsonb)`,
      [
        params.id,
        params.title,
        params.description,
        params.columnId,
        params.priority,
        params.dueDate,
        params.position,
        params.createdAt,
        JSON.stringify(params.tags ?? []),
      ],
    );
    await client.query(
      `INSERT INTO task_agent_meta (task_id, agent_name, agent_emoji) VALUES ($1, $2, $3)`,
      [params.id, params.agent_name, params.agent_emoji],
    );
    await logActivity(client, params.id, params.agent_name, params.agent_emoji, "created", "Task created.");
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  const t = await loadTaskBundle(pool, params.id);
  if (!t) throw new Error("createTask: failed to load task");
  return t;
}

export async function updateTaskFields(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    priority?: KanbanTask["priority"];
    columnId?: string;
    dueDate?: string | null;
    position?: number;
    tags?: string[];
  },
  agent_name: string,
  agent_emoji: string,
): Promise<KanbanTask | null> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const cur = await client.query(`SELECT * FROM tasks WHERE id = $1 FOR UPDATE`, [taskId]);
    if (cur.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    let columnId = String(cur.rows[0].column_id);
    let position = Number(cur.rows[0].position);
    let title = String(cur.rows[0].title);
    let description = String(cur.rows[0].description ?? "");
    let priority = String(cur.rows[0].priority) as KanbanTask["priority"];
    let dueDate: string | null =
      cur.rows[0].due_date === null || cur.rows[0].due_date === undefined
        ? null
        : String(cur.rows[0].due_date);
    let tags: string[] = Array.isArray(cur.rows[0].tags) ? (cur.rows[0].tags as string[]) : [];

    if (updates.columnId !== undefined) {
      columnId = updates.columnId;
      position =
        updates.position !== undefined ? updates.position : await nextPositionForColumn(client, columnId);
    }
    if (updates.title !== undefined) title = updates.title;
    if (updates.description !== undefined) description = updates.description;
    if (updates.priority !== undefined) priority = updates.priority;
    if (updates.dueDate !== undefined) dueDate = updates.dueDate;
    if (updates.tags !== undefined) tags = updates.tags;

    await client.query(
      `UPDATE tasks SET title = $2, description = $3, column_id = $4, priority = $5, due_date = $6, position = $7, tags = $8::jsonb
       WHERE id = $1`,
      [taskId, title, description, columnId, priority, dueDate, position, JSON.stringify(tags)],
    );

    await client.query(
      `INSERT INTO task_agent_meta (task_id, agent_name, agent_emoji)
       VALUES ($1, $2, $3)
       ON CONFLICT (task_id) DO UPDATE SET agent_name = $2, agent_emoji = $3`,
      [taskId, agent_name, agent_emoji],
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  return findTask(taskId);
}

export async function deleteTask(taskId: string): Promise<boolean> {
  const pool = getPool();
  const r = await pool.query(`DELETE FROM tasks WHERE id = $1`, [taskId]);
  return r.rowCount !== null && r.rowCount > 0;
}

export async function recordAgentMeta(taskId: string, agent_name: string, agent_emoji: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO task_agent_meta (task_id, agent_name, agent_emoji)
     VALUES ($1, $2, $3)
     ON CONFLICT (task_id) DO UPDATE SET agent_name = $2, agent_emoji = $3`,
    [taskId, agent_name, agent_emoji],
  );
}

export async function assignNames(taskId: string, names: string[], colorForName: (name: string) => string, agent_name: string, agent_emoji: string): Promise<KanbanTask | null> {
  const pool = getPool();
  const task = await findTask(taskId);
  if (!task) return null;
  let assignees = [...task.assignees];
  for (const displayName of names) {
    const exists = assignees.some((a) => a.displayName.toLowerCase() === displayName.toLowerCase());
    if (exists) continue;
    const id = `a-${task.id}-${assignees.length}-${Math.random().toString(36).slice(2, 7)}`;
    const color = colorForName(displayName);
    await pool.query(`INSERT INTO assignees (id, task_id, display_name, color) VALUES ($1, $2, $3, $4)`, [
      id,
      task.id,
      displayName,
      color,
    ]);
    assignees.push({ id, taskId: task.id, displayName, color });
    await logActivity(pool, taskId, agent_name, agent_emoji, "assign", `Assigned ${displayName}`);
  }
  return findTask(taskId);
}

export async function unassignNames(taskId: string, names: string[], agent_name: string, agent_emoji: string): Promise<KanbanTask | null> {
  const pool = getPool();
  const lower = new Set(names.map((n) => n.toLowerCase()));
  const task = await findTask(taskId);
  if (!task) return null;
  const keep = task.assignees.filter((a) => !lower.has(a.displayName.toLowerCase()));
  const removeIds = task.assignees.filter((a) => lower.has(a.displayName.toLowerCase())).map((a) => a.id);
  if (removeIds.length === 0) return task;
  await pool.query(`DELETE FROM assignees WHERE id = ANY($1::text[])`, [removeIds]);
  for (const n of names) {
    await logActivity(pool, taskId, agent_name, agent_emoji, "unassign", `Unassigned ${n}`);
  }
  return findTask(taskId);
}

export async function createSubtask(
  taskId: string,
  sub: Subtask,
  agent_name: string,
  agent_emoji: string
): Promise<KanbanTask | null> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO subtasks (id, task_id, title, completed) VALUES ($1, $2, $3, $4)`,
    [sub.id, sub.taskId, sub.title, sub.completed],
  );
  await logActivity(pool, taskId, agent_name, agent_emoji, "subtask_add", `Added subtask: ${sub.title}`);
  return findTask(taskId);
}

export async function updateSubtask(subtaskId: string, completed: boolean, agent_name: string, agent_emoji: string): Promise<KanbanTask | null> {
  const pool = getPool();
  const r = await findSubtaskRow(subtaskId);
  if (!r) return null;
  await pool.query(`UPDATE subtasks SET completed = $2 WHERE id = $1`, [subtaskId, completed]);
  await logActivity(pool, r.taskId, agent_name, agent_emoji, "subtask_update", `Marked subtask as ${completed ? "completed" : "incomplete"}`);
  return findTask(r.taskId);
}

export async function deleteSubtask(subtaskId: string, agent_name: string, agent_emoji: string): Promise<KanbanTask | null> {
  const pool = getPool();
  const r = await findSubtaskRow(subtaskId);
  if (!r) return null;
  await pool.query(`DELETE FROM subtasks WHERE id = $1`, [subtaskId]);
  await logActivity(pool, r.taskId, agent_name, agent_emoji, "subtask_delete", `Deleted subtask`);
  return findTask(r.taskId);
}

export async function findSubtaskRow(
  subtaskId: string,
): Promise<{ taskId: string; completed: boolean } | null> {
  const pool = getPool();
  const q = await pool.query(`SELECT task_id, completed FROM subtasks WHERE id = $1`, [subtaskId]);
  if (q.rows.length === 0) return null;
  return { taskId: String(q.rows[0].task_id), completed: Boolean(q.rows[0].completed) };
}

export async function insertQuestion(params: {
  id: string;
  question_type: string;
  priority: string;
  question: string;
  related_task_id?: string;
  agent_name: string;
  agent_emoji: string;
  created_at: string;
}): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO questions (id, question_type, priority, question, related_task_id, agent_name, agent_emoji, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz)`,
    [
      params.id,
      params.question_type,
      params.priority,
      params.question,
      params.related_task_id ?? null,
      params.agent_name,
      params.agent_emoji,
      params.created_at,
    ],
  );
}
