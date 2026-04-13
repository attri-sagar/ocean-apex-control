import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { KanbanTask } from "@/data/mockData";
import { boardColumns, kanbanTasks } from "@/data/kanbanData";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import TaskDetailPanel from "@/components/kanban/TaskDetailPanel";
import NewTaskModal from "@/components/kanban/NewTaskModal";
import { toast } from "sonner";

const TaskBoard = () => {
  const [tasks, setTasks] = useState<KanbanTask[]>(kanbanTasks);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    let filtered = tasks;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    if (filterPriority !== "all") {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }
    const map: Record<string, KanbanTask[]> = {};
    boardColumns.forEach((col) => {
      map[col.id] = filtered.filter((t) => t.columnId === col.id).sort((a, b) => a.position - b.position);
    });
    return map;
  }, [tasks, search, filterPriority]);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.columnId === "col-done").length;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    setTasks((prev) => {
      const updated = [...prev];
      const taskIdx = updated.findIndex((t) => t.id === draggableId);
      if (taskIdx === -1) return prev;

      updated[taskIdx] = { ...updated[taskIdx], columnId: destination.droppableId, position: destination.index };

      // Reorder positions within destination column
      const colTasks = updated
        .filter((t) => t.columnId === destination.droppableId && t.id !== draggableId)
        .sort((a, b) => a.position - b.position);
      colTasks.splice(destination.index, 0, updated[taskIdx]);
      colTasks.forEach((t, i) => {
        const idx = updated.findIndex((u) => u.id === t.id);
        if (idx !== -1) updated[idx] = { ...updated[idx], position: i };
      });

      return updated;
    });
    toast.success("Task moved");
  };

  const handleUpdateTask = (updated: KanbanTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedTask(null);
    toast.success("Task deleted");
  };

  const handleCreateTask = (task: KanbanTask) => {
    setTasks((prev) => [task, ...prev]);
  };

  // Mobile tab switcher
  const [mobileCol, setMobileCol] = useState(boardColumns[0].id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground font-heading">Board</h2>
          <p className="text-xs text-muted-foreground">{doneTasks}/{totalTasks} tasks completed</p>
        </div>
        <Button onClick={() => setNewTaskOpen(true)} size="sm" className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New Task
        </Button>
      </motion.div>

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 bg-secondary/30 border-border text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          {["all", "urgent", "high", "medium", "low"].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`text-[10px] px-2 py-1 rounded-lg transition-all capitalize ${
                filterPriority === p
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-secondary/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Mobile column tabs */}
      <div className="flex md:hidden gap-1 overflow-x-auto pb-1">
        {boardColumns.map((col) => (
          <button
            key={col.id}
            onClick={() => setMobileCol(col.id)}
            className={`text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
              mobileCol === col.id ? "bg-primary/15 text-primary border border-primary/30" : "bg-secondary/30 text-muted-foreground"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.color }} />
            {col.name}
            <span className="font-mono">({(tasksByColumn[col.id] || []).length})</span>
          </button>
        ))}
      </div>

      {/* Kanban columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Desktop */}
        <div className="hidden md:flex gap-4 overflow-x-auto pb-2">
          {boardColumns.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-1 min-w-[260px]"
            >
              <KanbanColumn column={col} tasks={tasksByColumn[col.id] || []} onTaskClick={setSelectedTask} />
            </motion.div>
          ))}
        </div>
        {/* Mobile: single column */}
        <div className="md:hidden">
          {boardColumns.filter((c) => c.id === mobileCol).map((col) => (
            <KanbanColumn key={col.id} column={col} tasks={tasksByColumn[col.id] || []} onTaskClick={setSelectedTask} />
          ))}
        </div>
      </DragDropContext>

      {/* Detail panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          columns={boardColumns}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* New task modal */}
      <NewTaskModal open={newTaskOpen} onClose={() => setNewTaskOpen(false)} columns={boardColumns} onCreate={handleCreateTask} />
    </div>
  );
};

export default TaskBoard;
