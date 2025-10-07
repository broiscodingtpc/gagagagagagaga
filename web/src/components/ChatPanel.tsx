import { useState, useRef, useEffect } from "react";
import { API_URL } from "../lib/config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  onActivity: (type: 'sending' | 'receiving') => void;
}

export default function ChatPanel({ onActivity }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    // Trigger orb reaction - sending
    onActivity('sending');

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.text || "Signal degraded.",
      };

      setMessages((m) => [...m, assistantMsg]);
      
      // Trigger orb reaction - receiving
      onActivity('receiving');
    } catch (err) {
      const errorMsg: Message = {
        role: "assistant",
        content: "⚠️ MNEX link unstable. Verify API server is running on :8787",
      };
      setMessages((m) => [...m, errorMsg]);
      
      onActivity('receiving');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">⚡ MNEX // NEURAL INTERFACE</div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-placeholder">
            Node interface active.<br />
            Transmit your query to the Nexus.
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            {msg.role === "assistant" ? (
              <pre>{msg.content}</pre>
            ) : (
              <div>{msg.content}</div>
            )}
          </div>
        ))}

        {loading && <div className="chat-loader">⚡ MNEX processing signal...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-wrap">
        <input
          className="chat-input"
          placeholder="Transmit to the Nexus..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button className="chat-btn" onClick={send} disabled={loading}>
          {loading ? "⚡" : "SEND"}
        </button>
      </div>
    </div>
  );
}
