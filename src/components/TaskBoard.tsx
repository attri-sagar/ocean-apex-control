import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tasks as initialTasks, Task } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Filter, Flame, Calendar, Tag, X } from "lucide-react";
import { toast } from "sonner";

const columns = [
  { id: "todo" as const, label: "To Do", color: "text-muted-foreground", dotColor: "bg-muted-foreground" },
  { id: "doing" as const, label: "In Progress", color: "text-primary", dotColor: "bg-primary" },
  { id: "needs-input" as const, label: "Needs Input", color: "text-amber", dotColor: "bg-amber" },
  { id: "done" as const, label: "Done", color: "text-emerald", dotColor: "bg-emerald" },
];

const priorityConfig: Record<string, { dot: string; label: string; glow?: string }> = {
  low: { dot: "bg-muted-foreground", label: "Low" },
  medium: { dot: "bg-primary", label: "Medium" },
  high: { dot: "bg-amber", label: "High", glow: "shadow-[0_0_6px_hsl(38_92%_50%/0.3)]" },
  urgent: { dot: "bg-destructive", label: "Urgent", glow: "shadow-[0_0_8px_hsl(0_84%_60%/0.4)]" },
};

const TaskBoard = () => {
  const [taskList, setTaskList] = useState<Task[]>(initialTasks);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>("all");

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDrop = (columnId: Task["column"]) => {
    if (!draggedId) return;
    setTaskList((prev) =>
      prev.map((t) => (t.id === draggedId ? { ...t, column: columnId, progress: columnId === "done" ? 100 : columnId === "todo" ? 0 : t.progress } : t))
    );
    setDraggedId(null);
    toast.success("Task moved");
  };

  const agentNames = [...new Set(taskList.map((t) => t.agentName))];
  const filtered = filterAgent === "all" ? taskList : taskList.filter((t) => t.agentName === filterAgent);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterAgent("all")}
            className={`text-[11px] px-2.5 py-1 rounded-lg transition-all ${filterAgent === "all" ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary/30 text-muted-foreground hover:text-foreground"}`}
          >
            All Agents
          </button>
          {agentNames.map((name) => (
            <button
              key={name}
              onClick={() => setFilterAgent(name)}
              className={`text-[11px] px-2.5 py-1 rounded-lg transition-all ${filterAgent === name ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary/30 text-muted-foreground hover:text-foreground"}`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <span>{filtered.filter((t) => t.column === "done").length}/{filtered.length} done</span>
        </div>
      </motion.div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col, ci) => {
          const colTasks = filtered.filter((t) => t.column === col.id);
          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.06 }}
              className="glass-card p-4 min-w-[260px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/40">
                    {colTasks.length}
                  </span>
                  {col.id === "todo" && (
                    <button
                      onClick={() => toast.info("New task form coming soon")}
                      className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Column progress */}
              {col.id === "doing" && colTasks.length > 0 && (
                <div className="mb-3 h-1 rounded-full bg-secondary/40 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${colTasks.reduce((acc, t) => acc + t.progress, 0) / colTasks.length}%` }}
                  />
                </div>
              )}

              <ScrollArea className="h-[420px]">
                <div className="space-y-2 pr-1">
                  {colTasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setSelectedTask(task)}
                      className="p-3 rounded-xl glass-card-inner cursor-grab active:cursor-grabbing hover:border-primary/15 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs text-foreground font-medium leading-snug flex-1">{task.title}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          {task.priority === "urgent" && <Flame className="w-3 h-3 text-destructive" />}
                          <span className={`w-2 h-2 rounded-full ${priorityConfig[task.priority].dot} ${priorityConfig[task.priority].glow || ""}`} />
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {task.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground/70 flex items-center gap-0.5">
                            <Tag className="w-2 h-2" />{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">{task.agentEmoji} {task.agentName}</span>
                        {task.column === "doing" && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1 rounded-full bg-secondary/50 overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${task.progress}%` }} />
                            </div>
                            <span className="font-mono text-primary">{task.progress}%</span>
                          </div>
                        )}
                        {task.column === "done" && (
                          <span className="text-emerald font-mono">✓ Done</span>
                        )}
                      </div>

                      {/* Due date */}
                      <div className="flex items-center gap-1 mt-1.5 text-[9px] text-muted-foreground/50">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>Due {task.dueDate}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">{selectedTask.title}</h3>
                <button onClick={() => setSelectedTask(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{selectedTask.description}</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Agent</span><span className="text-foreground">{selectedTask.agentEmoji} {selectedTask.agentName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><span className="text-foreground capitalize">{selectedTask.priority}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Progress</span><span className="text-foreground font-mono">{selectedTask.progress}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="text-foreground font-mono">{selectedTask.createdAt}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Due</span><span className="text-foreground font-mono">{selectedTask.dueDate}</span></div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {selectedTask.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{tag}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskBoard;
