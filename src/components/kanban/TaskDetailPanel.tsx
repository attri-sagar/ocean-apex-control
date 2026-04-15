import { useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { KanbanTask, BoardColumn, Subtask } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAgents } from "@/contexts/AgentsContext";
import { toast } from "sonner";

interface TaskDetailPanelProps {
  task: KanbanTask;
  columns: BoardColumn[];
  onClose: () => void;
  onUpdate: (updated: KanbanTask) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}

export default function TaskDetailPanel({ task, columns, onClose, onUpdate, onDelete }: TaskDetailPanelProps) {
  const { agents: roster, activeAgent } = useAgents();
  const myName = activeAgent?.name || "You";
  const myEmoji = activeAgent?.emoji || "👤";
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editColumn, setEditColumn] = useState(task.columnId);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || "");
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks);
  const [newSubtask, setNewSubtask] = useState("");
  const [assignees, setAssignees] = useState(task.assignees);
  const [newAssignee, setNewAssignee] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [localActivities, setLocalActivities] = useState<any[]>(task.activities || []);

  const assigneeColors = ["#0ea5e9", "#f59e0b", "#a855f7", "#ef4444", "#22c55e", "#f43f5e", "#06b6d4", "#8b5cf6"];

  const handleSave = async () => {
    try {
      await onUpdate({
        ...task,
        title: editTitle,
        description: editDesc,
        priority: editPriority,
        columnId: editColumn,
        dueDate: editDueDate || null,
        subtasks,
        assignees,
      });
    } catch {
      /* Parent shows toast */
    }
  };

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setLocalActivities((prev) => [{ id: `act-loc-${Date.now()}`, agentName: myName, agentEmoji: myEmoji, description: `Added subtask: ${newSubtask.trim()}`, createdAt: new Date().toISOString() }, ...prev]);
    setSubtasks((prev) => [...prev, { id: `s-new-${Date.now()}`, taskId: task.id, title: newSubtask.trim(), completed: false }]);
    setNewSubtask("");
  };

  const deleteSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const addAssignee = () => {
    if (!newAssignee.trim()) return;
    setLocalActivities((prev) => [{ id: `act-loc-${Date.now()}`, agentName: myName, agentEmoji: myEmoji, description: `Assigned ${newAssignee.trim()}`, createdAt: new Date().toISOString() }, ...prev]);
    setAssignees((prev) => [
      ...prev,
      { id: `a-new-${Date.now()}`, taskId: task.id, displayName: newAssignee.trim(), color: assigneeColors[prev.length % assigneeColors.length] },
    ]);
    setNewAssignee("");
  };

  const removeAssignee = (id: string) => {
    const a = assignees.find(x => x.id === id);
    if(a) setLocalActivities((prev) => [{ id: `act-loc-${Date.now()}`, agentName: myName, agentEmoji: myEmoji, description: `Unassigned ${a.displayName}`, createdAt: new Date().toISOString() }, ...prev]);
    setAssignees((prev) => prev.filter((a) => a.id !== id));
  };

  const completedCount = subtasks.filter((s) => s.completed).length;

  return (
    <>
      {/* Main task detail dialog */}
      <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="glass-card border-border max-w-lg max-h-[85vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="sticky top-0 z-10 glass-card border-b border-border px-5 py-4 flex items-center justify-between rounded-t-lg">
            <span className="text-xs text-muted-foreground font-mono">{task.id.toUpperCase()}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="p-5 space-y-5">
            {/* Title */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Title</label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-secondary/30 border-border text-sm font-semibold" />
            </div>

            {/* Priority + Column */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Priority</label>
                <Select value={editPriority} onValueChange={(v) => setEditPriority(v as KanbanTask["priority"])}>
                  <SelectTrigger className="bg-secondary/30 border-border text-xs h-9"><SelectValue /></SelectTrigger>
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
                <Select value={editColumn} onValueChange={setEditColumn}>
                  <SelectTrigger className="bg-secondary/30 border-border text-xs h-9"><SelectValue /></SelectTrigger>
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

            {/* Due date */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Due Date</label>
              <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="bg-secondary/30 border-border text-xs h-9" />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Description</label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={4} className="bg-secondary/30 border-border text-xs resize-none" />
            </div>

            {/* Assignees */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Assignees ({assignees.length})</label>
              <div className="space-y-1.5">
                {assignees.map((a) => (
                  <div key={a.id} className="flex items-center justify-between glass-card-inner px-3 py-1.5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: a.color }}>
                        {a.displayName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-xs text-foreground">{a.displayName}</span>
                    </div>
                    <button onClick={() => removeAssignee(a.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Select key={assignees.length} onValueChange={(val) => {
                  if (!val.trim()) return;
                  const target = roster.find(r => r.name === val.trim());
                  if (!target) return;
                  if (assignees.find(a => a.displayName === target.name)) return;
                  setLocalActivities((prev) => [{ id: `act-loc-${Date.now()}`, agentName: myName, agentEmoji: myEmoji, description: `Assigned ${target.name}`, createdAt: new Date().toISOString() }, ...prev]);
                  setAssignees((prev) => [
                    ...prev,
                    { id: `a-new-${Date.now()}`, taskId: task.id, displayName: target.name, color: target.accentColor || assigneeColors[prev.length % assigneeColors.length] },
                  ]);
                }}>
                  <SelectTrigger className="bg-secondary/30 border-border text-xs h-8 flex-1">
                    <SelectValue placeholder="Select assignee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roster.map(member => (
                      <SelectItem key={member.id} value={member.name}>
                        <span className="flex items-center gap-2">
                          <span>{member.emoji}</span>
                          <span>{member.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
              </div>
            </div>

            {/* Subtasks */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Subtasks ({completedCount}/{subtasks.length})</label>
              {subtasks.length > 0 && (
                <div className="h-1 rounded-full bg-secondary/50 overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${(completedCount / subtasks.length) * 100}%` }} />
                </div>
              )}
              <div className="space-y-1">
                {subtasks.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 glass-card-inner px-3 py-2 rounded-lg group/sub">
                    <Checkbox checked={s.completed} onCheckedChange={() => toggleSubtask(s.id)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <span className={`text-xs flex-1 ${s.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{s.title}</span>
                    <button onClick={() => deleteSubtask(s.id)} className="opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input placeholder="Add subtask..." value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSubtask()} className="bg-secondary/30 border-border text-xs h-8 flex-1" />
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={addSubtask}><Plus className="w-3 h-3" /></Button>
              </div>
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[9px] bg-primary/5 border-primary/20 text-primary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="text-[10px] text-muted-foreground/60 font-mono pt-2 border-t border-border">
              Created {new Date(task.createdAt).toLocaleDateString()}
            </div>

            
            {/* Task Timeline / Activity Log */}
            <div className="pt-4 mt-4 border-t border-border">
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-4 block font-semibold">
                Task Timeline
              </label>
              <div className="relative pl-3 max-h-60 overflow-y-auto pr-2">
                {/* The vertical connector line */}
                <div className="absolute left-[23px] top-3 bottom-3 w-[2px] bg-border z-0" />
                
                {localActivities.map((act: any) => (
                  <div key={act.id} className="relative flex gap-4 items-start mb-6 last:mb-2 z-10">
                    {/* Node */}
                    <div className="w-7 h-7 rounded-full bg-background border-2 border-muted flex items-center justify-center text-[12px] shadow-sm z-10 shrink-0">
                      {act.agentEmoji}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-0.5">
                      <div className="text-[10px] text-muted-foreground mb-1">
                        {new Date(act.createdAt).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        {act.description} <span className="text-muted-foreground/60 font-normal ml-1 text-[10px]">by {act.agentName}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!localActivities || localActivities.length === 0) && (
                  <div className="text-xs text-muted-foreground italic pl-10">No activity recorded yet.</div>
                )}
              </div>
            </div>

            {/* Save */}
            <Button onClick={handleSave} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="glass-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Task</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{task.title}"? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                void Promise.resolve(onDelete(task.id)).then(() => setConfirmDelete(false));
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
