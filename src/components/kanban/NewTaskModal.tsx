import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BoardColumn, KanbanTask } from "@/data/mockData";
import { toast } from "sonner";

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
  columns: BoardColumn[];
  onCreate: (task: KanbanTask) => void;
}

export default function NewTaskModal({ open, onClose, columns, onCreate }: NewTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<KanbanTask["priority"]>("medium");
  const [columnId, setColumnId] = useState(columns[0]?.id || "");
  const [dueDate, setDueDate] = useState("");

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    onCreate({
      id: `kt-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      columnId,
      priority,
      dueDate: dueDate || null,
      position: 0,
      createdAt: new Date().toISOString(),
      subtasks: [],
      assignees: [],
      tags: [],
    });
    toast.success("Task created");
    setTitle("");
    setDescription("");
    setPriority("medium");
    setColumnId(columns[0]?.id || "");
    setDueDate("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="glass-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">New Task</DialogTitle>
          <DialogDescription>Create a new task on the board.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title..." className="bg-secondary/30 border-border text-sm" autoFocus />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task..." rows={3} className="bg-secondary/30 border-border text-xs resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as KanbanTask["priority"])}>
                <SelectTrigger className="bg-secondary/30 border-border text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="medium">🔵 Medium</SelectItem>
                  <SelectItem value="low">⚪ Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Column</label>
              <Select value={columnId} onValueChange={setColumnId}>
                <SelectTrigger className="bg-secondary/30 border-border text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                        {col.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Due Date</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-secondary/30 border-border text-xs h-9" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
