"use client";

import { useRef, useState } from "react";
import type { Message } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "Review my resume and suggest improvements",
  "Help me write a cold outreach message to a recruiter",
  "What questions should I prep for a SDR interview?",
  "Compare my background to a typical sales engineer role",
];

export default function GeneralChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function sendMessage(override?: string) {
    const text = (override ?? input).trim();
    if (!text || streaming) return;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
        return;
      }

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
        setMessages([...newMessages, { role: "assistant", content: full }]);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      <div className="mb-4">
        <h1 className="text-lg font-semibold">General Chat</h1>
        <p className="text-sm text-muted-foreground">Ask for job advice, resume feedback, or anything career-related</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-muted-foreground px-1 mb-3">Try asking:</p>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left text-xs text-muted-foreground border border-border rounded-md px-3 py-2.5 hover:border-blue-500/40 hover:text-foreground hover:bg-accent transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "text-sm px-3 py-2 rounded-xl max-w-[85%] whitespace-pre-wrap leading-relaxed",
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-accent text-foreground rounded-bl-sm"
                )}
              >
                {m.content || (streaming && i === messages.length - 1 ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null)}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="p-3 border-t border-border flex gap-2">
          <Textarea
            className="flex-1"
            rows={3}
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            size="icon"
            className="self-end"
            onClick={() => sendMessage()}
            disabled={streaming || !input.trim()}
          >
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
