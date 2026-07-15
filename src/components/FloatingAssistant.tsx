import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Info, 
  FolderCheck,
  Languages,
  ArrowRight,
  Loader2
} from "lucide-react";
import { ChatMessage, Document } from "../types";
import GlassCard from "./GlassCard";

interface FloatingAssistantProps {
  documents: Document[];
  selectedDocumentId?: string;
  onVoiceFilterApplied: (filters: { search: string; category: string; expiryFilter: string }) => void;
}

export default function FloatingAssistant({
  documents,
  selectedDocumentId,
  onVoiceFilterApplied,
}: FloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your SecureID Document Assistant. I can help search, analyze, and translate details across your secure Aadhaar, PAN, Passport, and Insurance indices. Ask me anything!",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Voice simulation
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceWaves, setVoiceWaves] = useState<number[]>([10, 10, 10, 10, 10]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      documentId: selectedDocumentId
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          documentId: selectedDocumentId
        })
      });
      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: "reply_" + Date.now(),
            role: "assistant",
            content: data.response || "I could not generate an answer.",
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        throw new Error();
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: "error_" + Date.now(),
          role: "assistant",
          content: "Sorry, I am having trouble connecting to my cognitive center. Let me know if I can assist with simulated indices!",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Simulate Voice Assistant
  useEffect(() => {
    let interval: any;
    if (isVoiceActive) {
      interval = setInterval(() => {
        setVoiceWaves(Array.from({ length: 5 }, () => Math.floor(Math.random() * 40) + 10));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isVoiceActive]);

  const handleVoiceButtonClick = () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      return;
    }

    setIsVoiceActive(true);
    setVoiceTranscript("Listening to voice instructions...");

    // Choose a random realistic document assistant voice command to simulate
    const simulatedCommands = [
      "Show my passport details",
      "Find my health insurance policy",
      "Are there any expiring documents?",
      "Show me my Aadhaar card"
    ];
    const chosenCommand = simulatedCommands[Math.floor(Math.random() * simulatedCommands.length)];

    setTimeout(() => {
      setVoiceTranscript(`"${chosenCommand}"`);
    }, 1500);

    setTimeout(async () => {
      setIsVoiceActive(false);
      setVoiceTranscript("");
      
      // Send command to backend voice parsing
      try {
        const res = await fetch("/api/ai/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queryText: chosenCommand })
        });
        const filters = await res.json();
        
        // Apply mapped filters to Document list!
        onVoiceFilterApplied(filters);

        // Add to chat too!
        setMessages((prev) => [
          ...prev,
          {
            id: "voice_user_" + Date.now(),
            role: "user",
            content: `🎤 Applied voice search: "${chosenCommand}"`,
            timestamp: new Date().toISOString()
          },
          {
            id: "voice_reply_" + Date.now(),
            role: "assistant",
            content: `I've automatically updated your document view to search for: **${filters.category || filters.search || "your voice query"}**. Let me know if you need any other document indices!`,
            timestamp: new Date().toISOString()
          }
        ]);
      } catch (err) {
        console.error("Voice matching failed:", err);
      }
    }, 3500);
  };

  const selectedDocName = documents.find((d) => d.id === selectedDocumentId)?.name;

  return (
    <>
      {/* Floating Ball Indicator */}
      <button
        id="ai-floating-assistant"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-110 transition-transform cursor-pointer z-40"
        title="Open AI Document Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
          </span>
        )}
      </button>

      {/* Expandable Assistant Panel */}
      {isOpen && (
        <GlassCard className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] flex flex-col shadow-2xl z-40 overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <div>
                <h4 className="font-sans font-bold text-xs">SecureID AI Assistant</h4>
                <p className="text-[9px] text-indigo-200 font-mono">Grounded Gemini 3.5 Flash</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Context Banner */}
          {selectedDocumentId && (
            <div className="bg-indigo-50/70 dark:bg-slate-900/40 border-b border-indigo-100/30 dark:border-slate-800 px-3 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <FolderCheck className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-semibold">
                  Grounded on: <span className="text-slate-800 dark:text-white font-bold">{selectedDocName}</span>
                </span>
              </div>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded uppercase">Context Locked</span>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
            {messages.map((m) => {
              const isAssistant = m.role === "assistant";
              return (
                <div 
                  key={m.id}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    isAssistant
                      ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-250/20"
                      : "bg-indigo-500 text-white shadow-md shadow-indigo-500/5"
                  }`}>
                    <p className="whitespace-pre-line">{m.content}</p>
                    <span className={`text-[8px] block mt-1 text-right font-mono ${isAssistant ? "text-slate-400" : "text-white/60"}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Loader */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-250/20 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
                  <span className="text-[10px] text-slate-400 font-mono">Assistant is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Voice status visualization */}
          {isVoiceActive && (
            <div className="p-3 bg-indigo-500/5 border-t border-indigo-100/25 flex flex-col items-center justify-center shrink-0 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-1 h-8">
                {voiceWaves.map((h, i) => (
                  <span 
                    key={i} 
                    className="w-1 bg-indigo-500 rounded-full transition-all duration-100" 
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              <p className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse">
                {voiceTranscript}
              </p>
            </div>
          )}

          {/* Footer Input Area */}
          <div className="p-3 border-t border-slate-200/20 dark:border-slate-800/20 bg-white dark:bg-slate-950 flex items-center gap-2 shrink-0">
            <button
              onClick={handleVoiceButtonClick}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isVoiceActive
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200"
              }`}
              title="Voice Assistant (Search & Intent)"
            >
              {isVoiceActive ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
            </button>

            <input
              type="text"
              placeholder="Ask about passport, health policy, aadhaar..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs px-3 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
            />

            <button
              onClick={() => handleSendMessage()}
              className="p-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-sm cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </GlassCard>
      )}
    </>
  );
}
