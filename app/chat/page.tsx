"use client";

import { useRef, useState } from "react";
import type { Message } from "@/lib/supabase";

export default function GeneralChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function sendMessage() {
    if (!input.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

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

    setStreaming(false);
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      <h1 className="text-lg font-semibold mb-4">General Chat</h1>
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-600">
            Ask for job advice, resume feedback, or help drafting anything.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`text-sm ${m.role === "user" ? "text-right" : ""}`}>
            <span
              className={`inline-block px-3 py-2 rounded-lg max-w-[85%] text-left whitespace-pre-wrap ${
                m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-200"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <textarea
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm resize-none"
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
        <button
          onClick={sendMessage}
          disabled={streaming || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
