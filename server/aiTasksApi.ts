import { boardColumns } from "../src/data/kanbanData.ts";
import type { KanbanTask, Subtask } from "../src/data/mockData.ts";
import { getPool } from "./db/pool.ts";
import * as repo from "./aiTasksRepo.ts";

const ASSIGNEE_COLORS = [
  "#0ea5e9",
  "#f59e0b",
  "#a855f7",
  "#ef4444",
  "#22c55e",
  "#f43f5e",
  "#06b6d4",
  "#8b5cf6",
];

const COL_KEY_TO_ID: Record<string, string> = {
  to_do: "col-todo",
  todo: "col-todo",
  doing: "col-doing",
  needs_input: "col-needs-input",
  needsinput: "col-needs-input",
  done: "col-done",
  canceled: "col-canceled",
  cancelled: "col-canceled",
};

const COL_ID_TO_KEY: Record<string, string> = {
  "col-todo": "to_do",
  "col-doing": "doing",
  "col-needs-input": "needs_input",
  "col-done": "done",
  "col-canceled": "canceled",
};

function columnKeyToColumnId(input: string | undefined): string | null {
  if (input === undefined || input === null || input === "") return null;
  const n = String(input)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return COL_KEY_TO_ID[n] ?? null;
}

function columnIdToKey(columnId: string): string {
  return COL_ID_TO_KEY[columnId] ?? "to_do";
}

const PRIORITY_API_TO_INTERNAL: Record<string, KanbanTask["priority"]> = {
  low: "low",
  medium: "medium",
  high: "high",
  urgent: "urgent",
};

function parsePriority(v: string | undefined, fallback: KanbanTask["priority"]): KanbanTask["priority"] {
  if (!v) return fallback;
  const k = v.trim().toLowerCase();
  return PRIORITY_API_TO_INTERNAL[k] ?? fallback;
}

function priorityToApi(p: KanbanTask["priority"]): string {
  return p.charAt(0).toUpperCase() + p.slice(1);
}

/** Accepts optional tags array from API body; trims, caps length and count. */
function normalizeTagsInput(v: unknown): string[] {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) {
    if (typeof x !== "string") continue;
    const t = x.trim().slice(0, 64);
    if (t) out.push(t);
  }
  return out.slice(0, 32);
}

function getWebhookSecret(): string {
  return process.env.CLAWBUDDY_WEBHOOK_SECRET ?? "dev-local-secret";
}

function headerString(headers: Record<string, string | string[] | undefined>, name: string): string | undefined {
  const v = headers[name.toLowerCase()] ?? headers[name];
  if (Array.isArray(v)) return v[0];
  return v;
}

function validateWebhook(headers: Record<string, string | string[] | undefined>): boolean {
  const sent = headerString(headers, "x-webhook-secret");
  return sent === getWebhookSecret();
}

function requireAgents(body: Record<string, unknown>): { ok: true } | { ok: false; error: string } {
  const name = body.agent_name;
  const emoji = body.agent_emoji;
  if (typeof name !== "string" || !name.trim()) {
    return { ok: false, error: "agent_name is required" };
  }
  if (typeof emoji !== "string" || !emoji.trim()) {
    return { ok: false, error: "agent_emoji is required" };
  }
  return { ok: true };
}

function colorForName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return ASSIGNEE_COLORS[h % ASSIGNEE_COLORS.length];
}

function toApiTask(
  task: KanbanTask,
  meta?: { agent_name?: string; agent_emoji?: string },
): Record<string, unknown> {
  const col = boardColumns.find((c) => c.id === task.columnId);
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    column: columnIdToKey(task.columnId),
    column_info: col
      ? { id: col.id, name: col.name, color: col.color, position: col.position }
      : null,
    priority: priorityToApi(task.priority),
    due_date: task.dueDate,
    position: task.position,
    created_at: task.createdAt,
    tags: task.tags,
    subtasks: task.subtasks,
    assignees: task.assignees,
    activities: task.activities,
    agent_name: meta?.agent_name,
    agent_emoji: meta?.agent_emoji,
  };
}

async function apiTaskWithMeta(task: KanbanTask): Promise<Record<string, unknown>> {
  const batch = await repo.loadAgentMetaBatch([task.id]);
  const m = batch.get(task.id);
  return toApiTask(task, m ? { agent_name: m.agent_name, agent_emoji: m.agent_emoji } : undefined);
}

export async function handleAiTasksPost(
  headers: Record<string, string | string[] | undefined>,
  body: unknown,
): Promise<{ status: number; body: Record<string, unknown> }> {
  try {
    getPool();
  } catch (e) {
    return {
      status: 503,
      body: {
        error: "database_unavailable",
        message: e instanceof Error ? e.message : String(e),
      },
    };
  }

  if (!validateWebhook(headers)) {
    return { status: 401, body: { error: "unauthorized", message: "Invalid or missing x-webhook-secret" } };
  }

  if (body === null || typeof body !== "object") {
    return { status: 400, body: { error: "invalid_body", message: "JSON object required" } };
  }

  const b = body as Record<string, unknown>;
  const agents = requireAgents(b);
  if (!agents.ok) {
    return { status: 400, body: { error: "validation_error", message: agents.error } };
  }

  const agent_name = (b.agent_name as string).trim();
  const agent_emoji = (b.agent_emoji as string).trim();
  const request_type = typeof b.request_type === "string" ? b.request_type.toLowerCase() : "";
  const action = typeof b.action === "string" ? b.action.toLowerCase() : "";

  try {
    if (request_type === "task") {
      if (action === "create") {
        const title = typeof b.title === "string" ? b.title.trim() : "";
        if (!title) {
          return { status: 400, body: { error: "validation_error", message: "title is required" } };
        }
        const colKey =
          columnKeyToColumnId(typeof b.column === "string" ? b.column : "to_do") ?? "col-todo";
        const priority = parsePriority(typeof b.priority === "string" ? b.priority : undefined, "medium");
        const dueRaw = b.due_date;
        const dueDate =
          dueRaw === null || dueRaw === undefined || dueRaw === ""
            ? null
            : typeof dueRaw === "string"
              ? dueRaw
              : String(dueRaw);
        const description = typeof b.description === "string" ? b.description : "";
        const id = `kt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const position = await repo.nextPositionForColumn(getPool(), colKey);
        const createdAt = new Date().toISOString();
        const tags = normalizeTagsInput(b.tags);
        const task = await repo.createTask({
          id,
          title,
          description,
          columnId: colKey,
          priority,
          dueDate,
          position,
          createdAt,
          agent_name,
          agent_emoji,
          tags,
        });
        return { status: 200, body: { task: await apiTaskWithMeta(task) } };
      }

      if (action === "get") {
        const taskId = typeof b.task_id === "string" ? b.task_id : "";
        const task = await repo.findTask(taskId);
        if (!task) {
          return { status: 404, body: { error: "not_found", message: "Task not found" } };
        }
        await repo.recordAgentMeta(task.id, agent_name, agent_emoji);
        return { status: 200, body: { task: await apiTaskWithMeta(task) } };
      }

      if (action === "list") {
        let list: KanbanTask[];
        if (b.column !== undefined && b.column !== null && b.column !== "") {
          const cid = columnKeyToColumnId(String(b.column));
          if (!cid) {
            return { status: 400, body: { error: "validation_error", message: "Invalid column" } };
          }
          list = await repo.listTasks(cid);
        } else {
          list = await repo.listTasks(null);
        }
        const meta = await repo.loadAgentMetaBatch(list.map((t) => t.id));
        return {
          status: 200,
          body: {
            tasks: list.map((t) => {
              const m = meta.get(t.id);
              return toApiTask(t, m ? { agent_name: m.agent_name, agent_emoji: m.agent_emoji } : undefined);
            }),
          },
        };
      }

      if (action === "update") {
        const taskId = typeof b.task_id === "string" ? b.task_id : "";
        const task = await repo.findTask(taskId);
        if (!task) {
          return { status: 404, body: { error: "not_found", message: "Task not found" } };
        }
        await repo.recordAgentMeta(task.id, agent_name, agent_emoji);

        const updates: {
          title?: string;
          description?: string;
          priority?: KanbanTask["priority"];
          columnId?: string;
          dueDate?: string | null;
          tags?: string[];
        } = {};

        if (b.column !== undefined && b.column !== null && b.column !== "") {
          const cid = columnKeyToColumnId(String(b.column));
          if (!cid) {
            return { status: 400, body: { error: "validation_error", message: "Invalid column" } };
          }
          updates.columnId = cid;
        }

        if (typeof b.title === "string") updates.title = b.title;
        if (typeof b.description === "string") updates.description = b.description;
        if (b.priority !== undefined && typeof b.priority === "string") {
          updates.priority = parsePriority(b.priority, task.priority);
        }
        if (b.due_date !== undefined) {
          if (b.due_date === null || b.due_date === "") {
            updates.dueDate = null;
          } else if (typeof b.due_date === "string") {
            updates.dueDate = b.due_date;
          }
        }
        if (b.tags !== undefined) {
          updates.tags = normalizeTagsInput(b.tags);
        }

        const updated = await repo.updateTaskFields(taskId, updates, agent_name, agent_emoji);
        if (!updated) {
          return { status: 404, body: { error: "not_found", message: "Task not found" } };
        }
        return { status: 200, body: { task: await apiTaskWithMeta(updated) } };
      }

      if (action === "delete") {
        const taskId = typeof b.task_id === "string" ? b.task_id : "";
        const existed = await repo.findTask(taskId);
        if (!existed) {
          return { status: 404, body: { error: "not_found", message: "Task not found" } };
        }
        await repo.deleteTask(taskId);
        return { status: 200, body: { ok: true, deleted_task_id: taskId } };
      }
    }

    if (request_type === "assignee") {
      const taskId = typeof b.task_id === "string" ? b.task_id : "";
      const task = await repo.findTask(taskId);
      if (!task) {
        return { status: 404, body: { error: "not_found", message: "Task not found" } };
      }
      await repo.recordAgentMeta(task.id, agent_name, agent_emoji);

      if (action === "list") {
        return { status: 200, body: { assignees: task.assignees } };
      }

      const namesRaw = b.names;
      if (!Array.isArray(namesRaw) || !namesRaw.every((n) => typeof n === "string")) {
        return { status: 400, body: { error: "validation_error", message: "names must be an array of strings" } };
      }
      const names = namesRaw.map((n) => n.trim()).filter(Boolean);

      if (action === "assign") {
        const updated = await repo.assignNames(taskId, names, colorForName, agent_name, agent_emoji);
        if (!updated) {
          return { status: 404, body: { error: "not_found", message: "Task not found" } };
        }
        return {
          status: 200,
          body: { task: await apiTaskWithMeta(updated), assignees: updated.assignees },
        };
      }

      if (action === "unassign") {
        const updated = await repo.unassignNames(taskId, names, agent_name, agent_emoji);
        if (!updated) {
          return { status: 404, body: { error: "not_found", message: "Task not found" } };
        }
        return {
          status: 200,
          body: { task: await apiTaskWithMeta(updated), assignees: updated.assignees },
        };
      }
    }

    if (request_type === "subtask") {
      if (action === "create") {
        const taskId = typeof b.task_id === "string" ? b.task_id : "";
        const task = await repo.findTask(taskId);
        if (!task) {
          return { status: 404, body: { error: "not_found", message: "Task not found" } };
        }
        await repo.recordAgentMeta(task.id, agent_name, agent_emoji);
        const title = typeof b.title === "string" ? b.title.trim() : "";
        if (!title) {
          return { status: 400, body: { error: "validation_error", message: "title is required" } };
        }
        const completed = Boolean(b.completed);
        const sub: Subtask = {
          id: `s-${task.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          taskId: task.id,
          title,
          completed,
        };
        const updated = await repo.createSubtask(taskId, sub, agent_name, agent_emoji);
        if (!updated) {
          return { status: 404, body: { error: "not_found", message: "Task not found" } };
        }
        return { status: 200, body: { subtask: sub, task: await apiTaskWithMeta(updated) } };
      }

      if (action === "update") {
        const subtaskId = typeof b.subtask_id === "string" ? b.subtask_id : "";
        const row = await repo.findSubtaskRow(subtaskId);
        if (!row) {
          return { status: 404, body: { error: "not_found", message: "Subtask not found" } };
        }
        await repo.recordAgentMeta(row.taskId, agent_name, agent_emoji);
        const completed = b.completed !== undefined ? Boolean(b.completed) : row.completed;
        const updated = await repo.updateSubtask(subtaskId, completed, agent_name, agent_emoji);
        if (!updated) {
          return { status: 404, body: { error: "not_found", message: "Subtask not found" } };
        }
        const sub = updated.subtasks.find((s) => s.id === subtaskId);
        return { status: 200, body: { subtask: sub, task: await apiTaskWithMeta(updated) } };
      }

      if (action === "delete") {
        const subtaskId = typeof b.subtask_id === "string" ? b.subtask_id : "";
        const row = await repo.findSubtaskRow(subtaskId);
        if (!row) {
          return { status: 404, body: { error: "not_found", message: "Subtask not found" } };
        }
        await repo.recordAgentMeta(row.taskId, agent_name, agent_emoji);
        const updated = await repo.deleteSubtask(subtaskId, agent_name, agent_emoji);
        if (!updated) {
          return { status: 404, body: { error: "not_found", message: "Subtask not found" } };
        }
        return { status: 200, body: { ok: true, deleted_subtask_id: subtaskId, task: await apiTaskWithMeta(updated) } };
      }
    }

    if (request_type === "question" && action === "ask") {
      const q = typeof b.question === "string" ? b.question.trim() : "";
      if (!q) {
        return { status: 400, body: { error: "validation_error", message: "question is required" } };
      }
      const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const created_at = new Date().toISOString();
      await repo.insertQuestion({
        id,
        question_type: typeof b.question_type === "string" ? b.question_type : "question",
        priority: typeof b.priority === "string" ? b.priority : "normal",
        question: q,
        related_task_id: typeof b.related_task_id === "string" ? b.related_task_id : undefined,
        agent_name,
        agent_emoji,
        created_at,
      });
      const question = {
        id,
        question_type: typeof b.question_type === "string" ? b.question_type : "question",
        priority: typeof b.priority === "string" ? b.priority : "normal",
        question: q,
        related_task_id: typeof b.related_task_id === "string" ? b.related_task_id : undefined,
        agent_name,
        agent_emoji,
        created_at,
      };
      return { status: 200, body: { question } };
    }

    return {
      status: 400,
      body: {
        error: "unsupported_operation",
        message: `Unknown request_type/action: ${request_type}/${action}`,
      },
    };
  } catch (e) {
    return { status: 500, body: { error: "internal_error", message: String(e) } };
  }
}

export async function resetAiTasksStoreForTests(): Promise<void> {
  const p = getPool();
  await p.query("TRUNCATE tasks CASCADE");
}
