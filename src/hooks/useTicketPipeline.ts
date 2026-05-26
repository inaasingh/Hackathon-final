/**
 * useTicketPipeline — WebSocket hook for real-time ticket updates
 * Connects to pipeline.js WebSocket server on ws://localhost:3002
 */
import { useEffect, useState, useRef, useCallback } from "react";

export interface TicketAI {
  urgencyScore: number;
  category: string;
  subCategory: string;
  suggestedPriority: string;
  pattern: string;
  draftResponse: string;
  riskFlag: string | null;
  estimatedResolutionHours: number;
  processedAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  statusType: string;
  priority: string;
  channel: string;
  category: string;
  subCategory: string;
  classification: string;
  department: { name: string; id: string };
  assignee?: { firstName: string; lastName: string; email: string; id: string };
  contact: { firstName: string; lastName: string; email: string; phone?: string };
  team?: { name: string; id: string };
  createdTime: string;
  modifiedTime: string;
  dueDate?: string;
  closedTime?: string | null;
  isOverDue: boolean;
  isEscalated: boolean;
  commentCount: number;
  threadCount: number;
  resolution?: string;
  aiAnalysis?: TicketAI;
}

export interface TicketStats {
  total: number;
  open: number;
  onHold: number;
  resolved: number;
  urgent: number;
  high: number;
  avgUrgency: number;
}

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function useTicketPipeline() {
  const [tickets,    setTickets]    = useState<Ticket[]>([]);
  const [stats,      setStats]      = useState<TicketStats | null>(null);
  const [status,     setStatus]     = useState<ConnectionStatus>("connecting");
  const [lastEvent,  setLastEvent]  = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const wsRef    = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function computeStats(t: Ticket[]): TicketStats {
    return {
      total:    t.length,
      open:     t.filter(x => x.status === "Open" || x.statusType === "OPEN").length,
      onHold:   t.filter(x => x.status === "On Hold" || x.statusType === "ON HOLD").length,
      resolved: t.filter(x => ["Resolved","Closed"].includes(x.status) || x.statusType === "CLOSED").length,
      urgent:   t.filter(x => x.priority === "Urgent").length,
      high:     t.filter(x => x.priority === "High").length,
      avgUrgency: Math.round(t.reduce((s, x) => s + (x.aiAnalysis?.urgencyScore ?? 50), 0) / (t.length || 1)),
    };
  }

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const ws = new WebSocket("ws://localhost:3002");
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      console.log("[Pipeline] WebSocket connected");
      if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null; }
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        if (msg.type === "INIT") {
          setTickets(msg.tickets ?? []);
          setStats(computeStats(msg.tickets ?? []));

        } else if (msg.type === "NEW_TICKET") {
          setTickets(prev => {
            const updated = [msg.ticket, ...prev.filter(t => t.id !== msg.ticket.id)];
            setStats(computeStats(updated));
            return updated;
          });
          setLastEvent(`New ticket ${msg.ticket.id}: "${msg.ticket.subject}"`);
          setProcessing(false);

        } else if (msg.type === "PROCESSING") {
          setProcessing(true);
          setLastEvent(msg.message);
        }
      } catch (err) {
        console.error("[Pipeline] WS parse error", err);
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      console.log("[Pipeline] WebSocket disconnected — retrying in 5s");
      retryRef.current = setTimeout(connect, 5000);
    };

    ws.onerror = () => {
      setStatus("error");
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { tickets, stats, status, lastEvent, processing };
}
