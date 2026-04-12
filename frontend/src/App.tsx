import {useState} from "react";

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

export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");
    setResults([]);

    try {
      const response = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          top_k: 3,
        }),
      });

      if (!response.ok){
        throw new Error("Failed to fetch response from backend.");
      }

      const data: QueryResponse = await response.json();
      setAnswer(data.answer);
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message: "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

   return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>ZenithLabs</h1>
        <p style={styles.subtitle}>Ask NOVA a health and wellness question.</p>

        <div style={styles.inputRow}>
          <input
            type="text"
            placeholder="What should I eat after a workout?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            style={styles.input}
          />
          <button onClick={handleSubmit} style={styles.button} disabled={loading}>
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {answer && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Answer</h2>
            <p style={styles.answer}>{answer}</p>
          </div>
        )}

        {results.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Retrieved Context</h2>
            {results.map((result, index) => (
              <div key={`${result.source}-${index}`} style={styles.resultItem}>
                <p style={styles.source}>
                  <strong>Source:</strong> {result.source}
                </p>
                <p style={styles.text}>{result.text}</p>
                <p style={styles.distance}>
                  <strong>Distance:</strong> {result.distance.toFixed(4)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 20px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "900px",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: "1.5rem",
  },
  inputRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },
  input: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    fontSize: "1rem",
  },
  button: {
    padding: "14px 18px",
    borderRadius: "12px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
  card: {
    backgroundColor: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "12px",
  },
  answer: {
    lineHeight: 1.7,
  },
  resultItem: {
    borderTop: "1px solid #1f2937",
    paddingTop: "16px",
    marginTop: "16px",
  },
  source: {
    marginBottom: "8px",
    color: "#cbd5e1",
  },
  text: {
    marginBottom: "8px",
    lineHeight: 1.6,
  },
  distance: {
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  error: {
    color: "#f87171",
    marginBottom: "16px",
  },
};