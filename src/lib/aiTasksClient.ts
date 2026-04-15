import type { KanbanTask } from "@/data/mockData";

const API_PATH = "/functions/v1/ai-tasks";

function webhookSecret(): string {
  return import.meta.env.VITE_CLAWBUDDY_WEBHOOK_SECRET ?? "dev-local-secret";
}

async function postAiTasks(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(API_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": webhookSecret(),
    },
    body: JSON.stringify({
      agent_name: "Web UI",
      agent_emoji: "🖥️",
      ...body,
    }),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const msg = typeof data.message === "string" ? data.message : JSON.stringify(data);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data;
}

const API_COL_TO_ID: Record<string, string> = {
  to_do: "col-todo",
  todo: "col-todo",
  doing: "col-doing",
  needs_input: "col-needs-input",
  done: "col-done",
  canceled: "col-canceled",
  cancelled: "col-canceled",
};

export function columnIdToApiColumn(columnId: string): string {
  const map: Record<string, string> = {
    "col-todo": "to_do",
    "col-doing": "doing",
    "col-needs-input": "needs_input",
    "col-done": "done",
    "col-canceled": "canceled",
  };
  return map[columnId] ?? "to_do";
}

function parsePriorityApi(s: string): KanbanTask["priority"] {
  const k = s.trim().toLowerCase();
  if (k === "urgent" || k === "high" || k === "medium" || k === "low") return k;
  return "medium";
}

export function apiTaskToKanban(raw: Record<string, unknown>): KanbanTask {
  const col = String(raw.column ?? "to_do").toLowerCase();
  const normalized = col.replace(/[\s-]+/g, "_");
  const columnId = API_COL_TO_ID[normalized] ?? API_COL_TO_ID[col] ?? "col-todo";
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    columnId,
    priority: parsePriorityApi(String(raw.priority ?? "medium")),
    dueDate: raw.due_date === null || raw.due_date === undefined ? null : String(raw.due_date),
    position: typeof raw.position === "number" ? raw.position : Number(raw.position) || 0,
    createdAt: String(raw.created_at ?? new Date().toISOString()),
    subtasks: Array.isArray(raw.subtasks) ? (raw.subtasks as KanbanTask["subtasks"]) : [],
    assignees: Array.isArray(raw.assignees) ? (raw.assignees as KanbanTask["assignees"]) : [],
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    activities: Array.isArray(raw.activities) ? (raw.activities as any[]) : [],
  };
}

export async function listTasks(column?: string): Promise<KanbanTask[]> {
  const body: Record<string, unknown> = {
    request_type: "task",
    action: "list",
  };
  if (column) body.column = column;
  const data = await postAiTasks(body);
  const tasks = data.tasks;
  if (!Array.isArray(tasks)) return [];
  return tasks.map((t) => apiTaskToKanban(t as Record<string, unknown>));
}

export async function createTaskApi(params: {
  title: string;
  description: string;
  columnId: string;
  priority: KanbanTask["priority"];
  dueDate: string | null;
  tags?: string[];
}): Promise<KanbanTask> {
  const body: Record<string, unknown> = {
    request_type: "task",
    action: "create",
    title: params.title,
    description: params.description,
    column: columnIdToApiColumn(params.columnId),
    priority: params.priority.charAt(0).toUpperCase() + params.priority.slice(1),
    due_date: params.dueDate ?? undefined,
  };
  if (params.tags !== undefined) body.tags = params.tags;
  const data = await postAiTasks(body);
  const task = data.task;
  if (!task || typeof task !== "object") throw new Error("Invalid create response");
  return apiTaskToKanban(task as Record<string, unknown>);
}

export async function updateTaskFieldsApi(taskId: string, fields: {
  title?: string;
  description?: string;
  priority?: KanbanTask["priority"];
  columnId?: string;
  dueDate?: string | null;
  tags?: string[];
}): Promise<KanbanTask> {
  const body: Record<string, unknown> = {
    request_type: "task",
    action: "update",
    task_id: taskId,
  };
  if (fields.title !== undefined) body.title = fields.title;
  if (fields.description !== undefined) body.description = fields.description;
  if (fields.priority !== undefined) {
    body.priority = fields.priority.charAt(0).toUpperCase() + fields.priority.slice(1);
  }
  if (fields.columnId !== undefined) body.column = columnIdToApiColumn(fields.columnId);
  if (fields.dueDate !== undefined) body.due_date = fields.dueDate === null ? null : fields.dueDate;
  if (fields.tags !== undefined) body.tags = fields.tags;
  const data = await postAiTasks(body);
  const task = data.task;
  if (!task || typeof task !== "object") throw new Error("Invalid update response");
  return apiTaskToKanban(task as Record<string, unknown>);
}

export async function moveTaskApi(taskId: string, columnId: string): Promise<KanbanTask> {
  return updateTaskFieldsApi(taskId, { columnId });
}

export async function deleteTaskApi(taskId: string): Promise<void> {
  await postAiTasks({
    request_type: "task",
    action: "delete",
    task_id: taskId,
  });
}

export async function assignApi(taskId: string, names: string[]): Promise<void> {
  if (names.length === 0) return;
  await postAiTasks({
    request_type: "assignee",
    action: "assign",
    task_id: taskId,
    names,
  });
}

export async function unassignApi(taskId: string, names: string[]): Promise<void> {
  if (names.length === 0) return;
  await postAiTasks({
    request_type: "assignee",
    action: "unassign",
    task_id: taskId,
    names,
  });
}

export async function createSubtaskApi(taskId: string, title: string, completed: boolean): Promise<void> {
  await postAiTasks({
    request_type: "subtask",
    action: "create",
    task_id: taskId,
    title,
    completed,
  });
}

export async function updateSubtaskApi(subtaskId: string, completed: boolean): Promise<void> {
  await postAiTasks({
    request_type: "subtask",
    action: "update",
    subtask_id: subtaskId,
    completed,
  });
}

export async function deleteSubtaskApi(subtaskId: string): Promise<void> {
  await postAiTasks({
    request_type: "subtask",
    action: "delete",
    subtask_id: subtaskId,
  });
}

export async function syncTaskDetailApi(oldTask: KanbanTask, newTask: KanbanTask): Promise<KanbanTask> {
  await updateTaskFieldsApi(newTask.id, {
    title: newTask.title,
    description: newTask.description,
    priority: newTask.priority,
    columnId: newTask.columnId,
    dueDate: newTask.dueDate,
    tags: newTask.tags,
  });

  const oldNames = oldTask.assignees.map((a) => a.displayName);
  const newNames = newTask.assignees.map((a) => a.displayName);
  const oldSet = new Set(oldNames.map((n) => n.toLowerCase()));
  const newSet = new Set(newNames.map((n) => n.toLowerCase()));
  const toUnassign = oldNames.filter((n) => !newSet.has(n.toLowerCase()));
  const toAssign = newNames.filter((n) => !oldSet.has(n.toLowerCase()));
  await unassignApi(newTask.id, toUnassign);
  await assignApi(newTask.id, toAssign);

  const newSubById = new Map(newTask.subtasks.map((s) => [s.id, s] as const));

  for (const s of oldTask.subtasks) {
    if (!newSubById.has(s.id)) await deleteSubtaskApi(s.id);
  }
  for (const s of newTask.subtasks) {
    if (s.id.startsWith("s-new-")) {
      await createSubtaskApi(newTask.id, s.title, s.completed);
    } else {
      const prev = oldTask.subtasks.find((x) => x.id === s.id);
      if (prev && prev.completed !== s.completed) {
        await updateSubtaskApi(s.id, s.completed);
      }
    }
  }

  const refreshed = await postAiTasks({
    request_type: "task",
    action: "get",
    task_id: newTask.id,
  });
  const t = refreshed.task;
  if (t && typeof t === "object") return apiTaskToKanban(t as Record<string, unknown>);

  const list = await listTasks();
  return list.find((x) => x.id === newTask.id) ?? newTask;
}
