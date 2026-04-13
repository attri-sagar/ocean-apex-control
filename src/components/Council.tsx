import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { councilSessions } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ThumbsUp, ThumbsDown, MessageCircle, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

const statusBadge: Record<string, string> = {
  active: "bg-primary/15 text-primary border-primary/30",
  completed: "bg-emerald/15 text-emerald border-emerald/30",
  pending: "bg-amber/15 text-amber border-amber/30",
};

const statusIcon: Record<string, any> = {
  active: Loader2,
  completed: CheckCircle2,
  pending: Clock,
};

const participantStatus: Record<string, string> = {
  done: "✅",
  typing: "✍️",
  waiting: "⏳",
};

const Council = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalSessions = councilSessions.length;
  const activeSessions = councilSessions.filter((s) => s.status === "active").length;
  const completedSessions = councilSessions.filter((s) => s.status === "completed").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 flex flex-wrap items-center gap-6">
        <span className="text-sm font-semibold text-foreground">Council Sessions</span>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><MessageCircle className="w-3 h-3" /> {totalSessions} Total</span>
          <span className="flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> {activeSessions} Active</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> {completedSessions} Completed</span>
        </div>
      </motion.div>

      {/* Sessions */}
      {councilSessions.map((session, i) => {
        const StatusIcon = statusIcon[session.status];
        const isExpanded = expanded === session.id;
        const totalMessages = session.messages.length;
        const totalPossible = session.participants.reduce((acc, p) => acc + p.limit, 0);

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-hover overflow-hidden"
          >
            <button
              onClick={() => setExpanded(isExpanded ? null : session.id)}
              className="w-full p-5 flex items-start justify-between gap-4 text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] ${statusBadge[session.status]}`}>
                    <StatusIcon className={`w-3 h-3 mr-1 ${session.status === "active" ? "animate-spin" : ""}`} />
                    {session.status}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground">{totalMessages}/{totalPossible} messages</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-3">{session.question}</h3>

                {/* Verdict */}
                {session.verdict && (
                  <div className="mb-3 p-2.5 rounded-lg bg-emerald/5 border border-emerald/20 text-xs text-emerald flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{session.verdict}</span>
                  </div>
                )}

                {/* Participants */}
                <div className="flex flex-wrap gap-2">
                  {session.participants.map((p) => (
                    <span key={p.name} className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg glass-card-inner text-muted-foreground">
                      {p.emoji} {p.name}
                      <span className="font-mono text-[9px] text-muted-foreground/60">({p.sent}/{p.limit})</span>
                      <span className="text-xs">{participantStatus[p.status]}</span>
                    </span>
                  ))}
                </div>

                {/* Vote counts */}
                {session.votesFor !== undefined && (
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald"><ThumbsUp className="w-3 h-3" />{session.votesFor}</span>
                    <span className="flex items-center gap-1 text-destructive"><ThumbsDown className="w-3 h-3" />{session.votesAgainst}</span>
                  </div>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-2 border-t border-border/30 pt-4">
                    {session.messages.map((msg, mi) => (
                      <motion.div
                        key={mi}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: mi * 0.04 }}
                        className="flex items-start gap-3 p-3 rounded-xl glass-card-inner"
                      >
                        <span className="text-lg">{msg.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-foreground">{msg.name}</span>
                            <span className="text-[10px] font-mono text-primary px-1.5 py-0.5 rounded bg-primary/10">#{msg.number}</span>
                            <span className="text-[10px] text-muted-foreground/50 font-mono">{format(parseISO(msg.timestamp), "HH:mm")}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{msg.text}</p>
                        </div>
                      </motion.div>
                    ))}

                    {session.status === "active" && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground/50 pt-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Agents are still deliberating...</span>
                      </div>
                    )}

                    {session.status === "pending" && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground/50 pt-2">
                        <Clock className="w-3 h-3" />
                        <span>Session not yet started — waiting for agents to join.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Council;
