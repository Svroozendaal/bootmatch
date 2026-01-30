import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";

type Suggestion = { bootId: string; label: string };

type ResolveResult =
  | { status: "ok"; bootId: string; confidence: number }
  | {
      status: "ambiguous";
      confidence: number;
      alternatives: { bootId: string; label: string; score: number }[];
    }
  | { status: "not_found" };

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [alternatives, setAlternatives] = useState<
    { bootId: string; label: string }[]
  >([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const handle = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = (await res.json()) as Suggestion[];
      setSuggestions(data || []);
    }, 200);

    return () => clearTimeout(handle);
  }, [query]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setAlternatives([]);

    if (!query.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/resolve?q=${encodeURIComponent(query)}`);
    const data = (await res.json()) as ResolveResult;
    setLoading(false);

    if (data.status === "ok") {
      router.push(`/results/${data.bootId}`);
      return;
    }

    if (data.status === "ambiguous") {
      setStatus("ambiguous");
      setAlternatives(data.alternatives.map((a) => ({ bootId: a.bootId, label: a.label })));
      return;
    }

    setStatus("not_found");
  };

  return (
    <main>
      <h1>BootMatch</h1>
      <p className="notice">
        Type the ski boot you rented and we will suggest similar-fitting boots.
      </p>

      <section className="hero">
        <form onSubmit={submit} className="input-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your rented ski boot (e.g., ‘Salomon S/Pro 100’)"
          />
          <button className="button" type="submit" disabled={loading}>
            {loading ? "Finding..." : "Find similar boots"}
          </button>
        </form>

        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((s) => (
              <div
                key={s.bootId}
                className="suggestion"
                onClick={() => router.push(`/results/${s.bootId}`)}
              >
                {s.label}
              </div>
            ))}
          </div>
        )}

        {status === "ambiguous" && alternatives.length > 0 && (
          <div className="card">
            <h3>Did you mean...</h3>
            <div className="grid">
              {alternatives.map((alt) => (
                <button
                  key={alt.bootId}
                  className="button secondary"
                  onClick={() => router.push(`/results/${alt.bootId}`)}
                  type="button"
                >
                  {alt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {status === "not_found" && (
          <div className="card">
            <strong>No match found.</strong>
            <p className="notice">Try another spelling or include a flex like “110”.</p>
          </div>
        )}
      </section>
    </main>
  );
}
