import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppShell from "../components/AppShell";
import FeatureCards from "../components/FeatureCards";
import Hero from "../components/Hero";
import SearchBox, { SearchSuggestion } from "../components/SearchBox";
import styles from "../styles/home.module.css";

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
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
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
      const data = (await res.json()) as SearchSuggestion[];
      setSuggestions(data || []);
    }, 200);

    return () => clearTimeout(handle);
  }, [query]);

  const submit = async () => {
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
      setAlternatives(
        data.alternatives.map((a) => ({ bootId: a.bootId, label: a.label }))
      );
      return;
    }

    setStatus("not_found");
  };

  const quickSearches = ["Salomon S/Pro 100", "Tecnica Mach1", "Atomic Hawx Prime"];

  return (
    <AppShell>
      <section className={styles.heroSection}>
        <Hero />
        <div className={styles.searchArea}>
          <SearchBox
            value={query}
            onChange={setQuery}
            onSubmit={submit}
            loading={loading}
            suggestions={suggestions}
            onSelectSuggestion={(suggestion) =>
              router.push(`/results/${suggestion.bootId}`)
            }
            placeholder="e.g., Salomon S/Pro 100"
          />
          <div className={styles.quickLinks}>
            <span className={styles.quickLabel}>Try searching:</span>
            <div className={styles.quickButtons}>
              {quickSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="chip chip-button"
                  onClick={() => setQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {status === "ambiguous" && alternatives.length > 0 && (
          <div className={`card ${styles.statusCard}`}>
            <h3>Did you mean...</h3>
            <div className={styles.alternativeGrid}>
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
          <div className={`card ${styles.statusCard}`}>
            <strong>No match found.</strong>
            <p className="notice">
              Try another spelling or include a flex like 110.
            </p>
          </div>
        )}
      </section>

      <section className={styles.featuresSection}>
        <FeatureCards />
      </section>
    </AppShell>
  );
}
