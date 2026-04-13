import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { councilSessions } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { format, parseISO } from "date-fns";

const statusBadge: Record<string, string> = {
  active: "bg-primary/15 text-primary border-primary/30",
  completed: "bg-emerald/15 text-emerald border-emerald/30",
  pending: "bg-amber/15 text-amber border-amber/30",
};

const participantStatus: Record<string, string> = {
  done: "✅",
  typing: "✍️",
  waiting: "⏳",
};

const Council = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {councilSessions.map((session, i) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card overflow-hidden"
        >
          <button
            onClick={() => setExpanded(expanded === session.id ? null : session.id)}
            className="w-full p-5 flex items-start justify-between gap-4 text-left"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`text-xs ${statusBadge[session.status]}`}>
                  {session.status}
                </Badge>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-3">{session.question}</h3>
              <div className="flex flex-wrap gap-2">
                {session.participants.map((p) => (
                  <span key={p.name} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">
                    {p.emoji} {p.name} ({p.sent}/{p.limit}) {participantStatus[p.status]}
                  </span>
                ))}
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform ${expanded === session.id ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {expanded === session.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-3 border-t border-border/50 pt-4">
                  {session.messages.map((msg, mi) => (
                    <motion.div
                      key={mi}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: mi * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <span className="text-lg">{msg.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-foreground">{msg.name}</span>
                          <span className="text-xs font-mono text-muted-foreground">#{msg.number}</span>
                          <span className="text-xs text-muted-foreground/60 font-mono">{format(parseISO(msg.timestamp), "HH:mm")}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{msg.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default Council;
