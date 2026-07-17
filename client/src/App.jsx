import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const text = input;
    setInput("");
    setLoading(true);

    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat?stream=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        for (const line of buffer.split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                setMessages((m) => {
                  const updated = [...m];
                  const last = { ...updated[updated.length - 1] };
                  last.content += data.token;
                  updated[updated.length - 1] = last;
                  return updated;
                });
              }
            } catch {}
          }
        }
        buffer = "";
      }
    } catch {
      setMessages((m) => {
        const updated = [...m];
        const last = updated[updated.length - 1];
        if (last.role === "assistant" && !last.content) {
          last.content = "Error: could not reach server";
        }
        return updated;
      });
    }
    setLoading(false);
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Assistant</h1>
      </header>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <div className="bubble">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {m.content || (loading && i === messages.length - 1 ? "..." : "")}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="input-area" onSubmit={send}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
}

export default App;
