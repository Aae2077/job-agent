"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
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

  // Voice state (initialized on mount to avoid SSR mismatch)
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setVoiceSupported(
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window
    );
    setTtsSupported("speechSynthesis" in window);
  }, []);

  // ── Voice ────────────────────────────────────────────────────────────────────

  function startListening() {
    if (!voiceSupported || listening) return;
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SpeechRecognitionAPI();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";
    r.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      setListening(false);
    };
    r.onerror = () => setListening(false);
    r.onnomatch = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function speak(text: string) {
    if (!ttsEnabled || !ttsSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setTtsPlaying(true);
    utterance.onend = () => setTtsPlaying(false);
    utterance.onerror = () => setTtsPlaying(false);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setTtsPlaying(false);
  }

  // ── Chat ─────────────────────────────────────────────────────────────────────

  async function sendMessage(override?: string) {
    const text = (override ?? input).trim();
    if (!text || streaming) return;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    let full = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: "Something went wrong. Please try again." },
        ]);
        return;
      }

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
        setMessages([...newMessages, { role: "assistant", content: full }]);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } finally {
      setStreaming(false);
      if (full) speak(full);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-96px)]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h1 className="text-lg font-semibold">Career Assistant</h1>
          </div>
          {ttsSupported && (
            <button
              onClick={() => {
                if (ttsPlaying) stopSpeaking();
                setTtsEnabled((v) => !v);
              }}
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center transition-all",
                ttsEnabled
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              title={ttsEnabled ? "Mute responses" : "Speak responses aloud"}
            >
              {ttsEnabled ? (
                <Volume2 className="h-3.5 w-3.5" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Ask for job advice, resume feedback, or interview prep
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 pb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">How can I help?</p>
                <p className="text-xs text-muted-foreground">Try one of these to get started</p>
              </div>
              <div className="w-full max-w-sm space-y-1.5">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-left text-xs text-muted-foreground border border-border rounded-lg px-3 py-2.5 hover:border-primary/30 hover:text-foreground hover:bg-accent transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "assistant" && (
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "text-sm px-3.5 py-2.5 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-accent text-foreground rounded-tl-sm"
                )}
              >
                {m.content ||
                  (streaming && i === messages.length - 1 ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  ) : null)}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border flex gap-2 bg-background/50">
          <Textarea
            className="flex-1 min-h-0 resize-none text-sm"
            rows={2}
            placeholder="Ask anything about your job search..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          {voiceSupported && (
            <button
              onClick={listening ? stopListening : startListening}
              disabled={streaming}
              className={cn(
                "self-end shrink-0 h-9 w-9 rounded-lg border flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer",
                listening
                  ? "bg-red-500/10 border-red-500/40 text-red-400 animate-pulse"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
              )}
              title={listening ? "Stop recording" : "Voice input"}
            >
              {listening ? (
                <MicOff className="h-3.5 w-3.5" />
              ) : (
                <Mic className="h-3.5 w-3.5" />
              )}
            </button>
          )}
          <Button
            size="icon"
            className="self-end shrink-0"
            onClick={() => sendMessage()}
            disabled={streaming || !input.trim()}
          >
            {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
