import { useState, useRef, useEffect } from "react";

type QueryResult = {
  source: string;
  text: string;
  distance: number;
};

type QueryResponse = {
  query: string;
  answer: string;
  results: QueryResult[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  results?: QueryResult[];
  loading?: boolean;
};

export default function App() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false)

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  //'Smooth' scrolling on new messages feature
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({behavior:"smooth"});
  }, [messages]);


  //'ChatGPT' style print animation, reveals one character at a time + Blinking cursor
   const typeAssistantMessage = (fullText: string, results?: QueryResult[]) => {
    let index = 0;
    setIsTyping(true);

    const interval = setInterval(() => {
      index++;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: fullText.slice(0, index),
          results: index >= fullText.length ? results : undefined,
        };
        return updated;
      });

      if (index >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15); // Controls typing speed
  };




  const handleSubmit = async () => {
    if (!query.trim() || loading) return;

    const userQuery = query.trim();
    setQuery("");
    setError("");
    setLoading(true);

    const userMessage: ChatMessage = {
      role: "user",
      content: userQuery,
    };

    const thinkingMessage: ChatMessage = {
      role: "assistant",
      content: "Atlas is building your plan...",
      loading: true,
    };

    setMessages((prev) => [...prev, userMessage, thinkingMessage]);

    try {
      const response = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userQuery,
          top_k: 3,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from backend.");
      }

      const data: QueryResponse = await response.json();

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "",
          loading: false,
        };
        return updated;
      });

      typeAssistantMessage(data.answer, data.results);

    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong while contacting the backend.",
        };
        return updated;
      });

      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>MyTrainer.AI</h1>
        <p style={styles.subtitle}>Ask Atlas your AI personal trainer and coaching agent.</p>

        <div style={styles.chatWindow}>
          {messages.length === 0 && (
            <div style={styles.emptyState}>
              <p>Start by asking something like:</p>
              <p style={styles.example}>"What should I eat after a workout?"</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                ...styles.messageRow,
                justifyContent:
                  message.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.messageBubble,
                  ...(message.role === "user"
                    ? styles.userBubble
                    : styles.assistantBubble),
                }}
              >
                <div style={styles.messageLabel}>
                  {message.role === "user" ? "You" : "Atlas"}
                </div>

                <p style={styles.messageText}>
                  {message.loading ? (
                      <span>
                      Atlas is synthesising insights<span style={styles.dots}>...</span>
                    </span>
                  ) : (
                      <>
                        {message.content}
                        {message.role === "assistant" &&
                            index === messages.length - 1 &&
                            isTyping && <span style={styles.cursor}>|</span>}
                      </>
                  )}
                </p>

                {message.role === "assistant" &&
                  !message.loading &&
                  message.results &&
                  message.results.length > 0 && (
                    <div style={styles.sourcesBox}>
                      <h4 style={styles.sourcesTitle}>Retrieved Context</h4>
                      {message.results.map((result, i) => (
                        <div key={i} style={styles.sourceItem}>
                          <strong>{result.source}</strong>
                          <p style={styles.sourceText}>{result.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>


        <div style={styles.inputRow}>
          <input
            type="text"
            placeholder="Ask Atlas a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            style={styles.input}
          />
          <button
            onClick={handleSubmit}
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    padding: "32px 20px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2.25rem",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: "20px",
  },
  chatWindow: {
    minHeight: "420px",
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    overflowY: "auto",
  },
  emptyState: {
    color: "#94a3b8",
    textAlign: "center",
    padding: "60px 20px",
  },
  example: {
    color: "#cbd5e1",
    fontStyle: "italic",
  },
  messageRow: {
    display: "flex",
    marginBottom: "16px",
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: "16px",
    padding: "14px 16px",
    lineHeight: 1.6,
  },
  userBubble: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
  },
  assistantBubble: {
    backgroundColor: "#1e293b",
    color: "#e2e8f0",
  },
  messageLabel: {
    fontSize: "0.8rem",
    opacity: 0.8,
    marginBottom: "6px",
    fontWeight: 600,
  },
  messageText: {
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  dots: {
    letterSpacing: "2px",
  },
  sourcesBox: {
    marginTop: "14px",
    paddingTop: "12px",
    borderTop: "1px solid #334155",
  },
  sourcesTitle: {
    margin: "0 0 10px 0",
    fontSize: "0.95rem",
  },
  sourceItem: {
    marginBottom: "12px",
  },
  sourceText: {
    margin: "6px 0 0 0",
    color: "#cbd5e1",
    fontSize: "0.95rem",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "#ffffff",
    fontSize: "1rem",
  },
  button: {
    padding: "14px 18px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
  error: {
    marginTop: "12px",
    color: "#f87171",
  },
  cursor: {
  display: "inline-block",
  marginLeft: "2px",
  animation: "blink 1s step-start infinite",
  fontWeight: 400,
},
};