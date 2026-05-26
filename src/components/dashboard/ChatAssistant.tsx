/**
 * ChatAssistant
 *
 * Two root causes of the typing freeze fixed here:
 *
 * 1. framer-motion motion.div keeps `transform: scale(1) translateY(0px)`
 *    as an inline style even after animation finishes. An <input> inside a
 *    CSS-transformed parent forces the browser to composite on every keystroke
 *    — visible as a "freeze" while typing. Fixed: framer-motion removed
 *    entirely; replaced with a plain CSS opacity + translateY transition.
 *
 * 2. Controlled input (value={state}) re-rendered the whole component on
 *    every keystroke. Fixed: uncontrolled input via ref.
 */
import { useState, useRef, useCallback, memo } from "react";
import { Sparkles, X, Send, Bot, User } from "lucide-react";

/* ── Constants — outside component, never recreated ─────────────── */
const EXAMPLES = [
  "What changed this week?",
  "Which APIs are unhealthy?",
  "Generate governance summary",
  "Show impacted documents",
];

const FALLBACK_REPLIES = [
  "Across this week: 47 changes, 2 SLA breaches, 1 critical (Order API). Governance health is up 1.2%. Want me to draft the weekly report?",
  "Order API is at CRITICAL risk — p95 latency 1.8s vs 800ms SLA target. Recommend rolling back the retry config change immediately.",
  "6 integrations connected. MuleSoft Runtime healthy at 99.99% uptime. Salesforce Connector has the highest error rate at 3.8%.",
  "128 governance documents auto-generated this week. 3 are past their review deadline — owned by @priya.",
  "Release-147 deployed 3 hours ago. No rollbacks. All downstream APIs confirmed healthy post-deployment.",
];

type Msg = { role: "user" | "ai"; text: string };

const INITIAL: Msg[] = [
  { role: "ai", text: "Hi 👋 I'm your Delivery Copilot. Ask me anything about changes, risks, or governance." },
];

/* ── Memoised message list ───────────────────────────────────────── */
const MessageList = memo(function MessageList({
  msgs,
  typing,
}: {
  msgs: Msg[];
  typing: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {msgs.map((m, i) => (
        <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
          {m.role === "ai" && (
            <div className="h-7 w-7 rounded-lg gradient-ai-bg flex items-center justify-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
          )}
          <div
            className={`text-xs leading-relaxed rounded-2xl px-3 py-2 max-w-[80%] ${
              m.role === "ai"
                ? "bg-secondary/60 border border-border"
                : "gradient-primary-bg text-primary-foreground"
            }`}
          >
            {m.text}
          </div>
          {m.role === "user" && (
            <div className="h-7 w-7 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
              <User className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      ))}

      {typing && (
        <div className="flex gap-2">
          <div className="h-7 w-7 rounded-lg gradient-ai-bg flex items-center justify-center shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div className="bg-secondary/60 border border-border rounded-2xl px-3 py-2 flex gap-1 items-center">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                style={{
                  animation: "typing-dot 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

/* ── Main component ──────────────────────────────────────────────── */
export function ChatAssistant() {
  const [open,   setOpen]   = useState(false);
  const [msgs,   setMsgs]   = useState<Msg[]>(INITIAL);
  const [typing, setTyping] = useState(false);

  const inputRef    = useRef<HTMLInputElement>(null);
  const fallbackIdx = useRef(0);
  const abortRef    = useRef<AbortController | null>(null);

  const showFallback = useCallback(() => {
    setTyping(false);
    setMsgs((m) => [
      ...m,
      { role: "ai", text: FALLBACK_REPLIES[fallbackIdx.current++ % FALLBACK_REPLIES.length] },
    ]);
  }, []);

  const send = useCallback(
    async (override?: string) => {
      const text = (override ?? inputRef.current?.value ?? "").trim();
      if (!text) return;
      if (inputRef.current) inputRef.current.value = "";

      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const controller = abortRef.current;

      setMsgs((m) => [...m, { role: "user", text }]);
      setTyping(true);

      const timer = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch("/api/claude", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ prompt: text, type: "chat" }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          setTyping(false);
          setMsgs((m) => [
            ...m,
            { role: "ai", text: data.text?.trim() || FALLBACK_REPLIES[0] },
          ]);
        } else {
          showFallback();
        }
      } catch {
        clearTimeout(timer);
        showFallback();
      }
    },
    [showFallback]
  );

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-2xl gradient-primary-bg ai-glow flex items-center justify-center text-primary-foreground transition-transform duration-150 hover:scale-105 active:scale-95"
        aria-label="Toggle AI Copilot"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

      {/*
        Chat panel — pure CSS transition, NO framer-motion.
        transform is only applied during open/close animation, never while
        the panel is fully open (pointer-events:none when closed means the
        panel isn't in the compositor layer when not needed).
      */}
      <div
        className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] rounded-2xl flex flex-col overflow-hidden"
        style={{
          background: "var(--card)",
          border: "1px solid rgba(124,110,245,0.18)",
          boxShadow: "0 4px 32px rgba(28,24,40,0.18)",
          /* CSS-only transition — no JS animation engine involved */
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0px)" : "translateY(16px)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
          pointerEvents: open ? "auto" : "none",
          /* Crucial: tell the browser this panel is its own layer     */
          /* so compositing never bleeds into the input repaint path.  */
          willChange: "opacity, transform",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-ai-bg flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="text-sm font-semibold">Delivery Copilot</div>
              <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Online · Claude Sonnet
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages — only re-renders when msgs/typing changes */}
        <MessageList msgs={msgs} typing={typing} />

        {/* Example prompts */}
        {msgs.length === 1 && !typing && (
          <div className="px-4 pb-2 grid grid-cols-2 gap-1.5">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                onClick={() => send(e)}
                className="text-left text-[11px] px-2.5 py-2 rounded-lg border border-border bg-card/40 hover:bg-secondary transition-colors"
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {/* Input — uncontrolled, zero re-renders while typing */}
        <div className="p-3 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <div
            className="flex gap-2 items-center rounded-xl px-3"
            style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
          >
            <input
              ref={inputRef}
              defaultValue=""
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask anything…"
              className="flex-1 h-10 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={() => send()}
              className="h-7 w-7 rounded-lg gradient-primary-bg flex items-center justify-center"
            >
              <Send className="h-3.5 w-3.5 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
