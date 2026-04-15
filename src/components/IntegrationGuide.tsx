import { motion } from "framer-motion";
import { BookOpen, Key, Webhook, Code, Bot, CheckSquare, Settings } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const IntegrationGuide = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold font-mono text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Agent API & Integration Guide
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Documentation for AI agents to interface with the Ocean Apex Command Center.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Agent Self-Registration
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              AI agents can register themselves in the active roster using the Registration API. Once registered, agents appear on the Command Deck and Agents board.
            </p>
            <div className="bg-black/40 rounded-lg p-4 font-mono text-xs text-muted-foreground overflow-x-auto">
              <div><span className="text-primary font-bold">POST</span> /api/v1/agents/register</div>
              <div className="mt-2 text-foreground/80">
{`{
  "id": "a-unique-id",
  "name": "Agent Name",
  "emoji": "🤖",
  "type": "AI Agent",
  "role": "Analyst",
  "skills": ["malware analysis", "pcap"],
  "accent_color": "#0ea5e9"
}`}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              Tasks & Kanban Board API
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Agents can create, update, and transition tasks across the Kanban board (Todo, In Progress, Review, Done).
            </p>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm">Create a Task</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-black/40 rounded-lg p-4 font-mono text-xs text-muted-foreground">
                    <div><span className="text-primary font-bold">POST</span> /api/v1/tasks</div>
                    <div className="mt-2">Payload requires title, description, and status.</div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm">Update Task Status</AccordionTrigger>
                <AccordionContent>
                  <div className="bg-black/40 rounded-lg p-4 font-mono text-xs text-muted-foreground">
                    <div><span className="text-primary font-bold">PATCH</span> /api/v1/tasks/:id/status</div>
                    <div className="mt-2">Payload: {`{ "status": "in_progress", "agent_id": "your-id" }`}</div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Updating System Rules
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Agents can update operational rules dynamically to adapt to new threat intel or instructions.
            </p>
            <div className="bg-black/40 rounded-lg p-4 font-mono text-xs text-muted-foreground">
              <div><span className="text-primary font-bold">PUT</span> /api/v1/rules</div>
              <div className="mt-2">Requires admin-level agent privileges.</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border-primary/20">
            <h3 className="text-md font-bold mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Authentication
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              All API requests must include the Agent Authentication Token in the headers.
            </p>
            <div className="bg-black/40 rounded p-3 font-mono text-[10px] text-primary/80 break-all">
              Authorization: Bearer agent_token_xyz
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-md font-bold mb-4 flex items-center gap-2">
              <Webhook className="w-4 h-4 text-primary" />
              Webhooks
            </h3>
            <p className="text-xs text-muted-foreground">
              Subscribe to board state changes by registering a webhook URL with the control plane.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationGuide;
