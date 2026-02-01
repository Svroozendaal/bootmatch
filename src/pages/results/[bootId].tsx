import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import { BootDTO } from "../../types/boot";
import styles from "../../styles/results.module.css";

type MatchItem = {
  boot: BootDTO;
  score: number;
  reasons: string[];
  bestOffer?: { price: number; currency: string; retailer: string; url: string };
};

type MatchResponse = {
  baseBoot: BootDTO;
  matches: MatchItem[];
};

export default function ResultsPage() {
  const router = useRouter();
  const { bootId } = router.query as { bootId?: string };
  const [data, setData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bootId) return;
    const run = async () => {
      setLoading(true);
      const res = await fetch(`/api/match?bootId=${bootId}`);
      const json = (await res.json()) as MatchResponse;
      setData(json);
      setLoading(false);
    };
    run();
  }, [bootId]);

  if (loading) {
    return (
      <AppShell title="Results">
        <p className="notice">Loading matches...</p>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell title="Results">
        <p className="notice">Unable to load matches.</p>
      </AppShell>
    );
  }

  const base = data.baseBoot;

  return (
    <AppShell title={base.canonicalName}>
      <div className={styles.headerRow}>
        <Link href="/" className="button ghost">
          Back
        </Link>
      </div>

      <section className={`card ${styles.baseCard}`}>
        <h1>{base.canonicalName}</h1>
        <div className="chips">
          {base.volumeClass && <span className="chip">{base.volumeClass}</span>}
          {base.lastMm && <span className="chip">{base.lastMm}mm last</span>}
          {base.flexIndex && <span className="chip">Flex {base.flexIndex}</span>}
        </div>
      </section>

      <section>
        <div className={styles.matchesHeader}>
          <h2>Top 10 similar boots</h2>
          <p className="notice">Ranked by fit, volume, and flex similarity.</p>
        </div>
        <div className={styles.matchesGrid}>
          {data.matches.map((match) => (
            <div key={match.boot.id} className={`card ${styles.matchCard}`}>
              <h3>{match.boot.canonicalName}</h3>
              <div className="chips">
                {match.boot.volumeClass && (
                  <span className="chip">{match.boot.volumeClass}</span>
                )}
                {match.boot.lastMm && (
                  <span className="chip">{match.boot.lastMm}mm last</span>
                )}
                {match.boot.flexIndex && (
                  <span className="chip">Flex {match.boot.flexIndex}</span>
                )}
                <span className="chip">Score {match.score.toFixed(1)}</span>
              </div>
              <ul className={styles.reasonList}>
                {match.reasons.slice(0, 3).map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              {match.bestOffer && (
                <div className={styles.offerRow}>
                  <span className={styles.offerPrice}>
                    From {match.bestOffer.currency} {match.bestOffer.price.toFixed(0)}
                  </span>
                  <a
                    className="button small"
                    href={match.bestOffer.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buy
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
