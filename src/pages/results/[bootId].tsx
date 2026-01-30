import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BootDTO } from "../../types/boot";

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
      <main>
        <p>Loading matches...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main>
        <p>Unable to load matches.</p>
      </main>
    );
  }

  const base = data.baseBoot;

  return (
    <main>
      <button className="button secondary" onClick={() => router.push("/")}>Back</button>
      <h1 style={{ marginTop: 16 }}>{base.canonicalName}</h1>
      <div className="chips">
        {base.volumeClass && <span className="chip">{base.volumeClass}</span>}
        {base.lastMm && <span className="chip">{base.lastMm}mm last</span>}
        {base.flexIndex && <span className="chip">Flex {base.flexIndex}</span>}
      </div>

      <h2 style={{ marginTop: 28 }}>Top 10 similar boots</h2>
      <div className="grid columns-2">
        {data.matches.map((match) => (
          <div key={match.boot.id} className="card">
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
            <ul className="notice">
              {match.reasons.slice(0, 3).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            {match.bestOffer && (
              <p>
                From {match.bestOffer.currency} {match.bestOffer.price.toFixed(0)} ·{" "}
                <a href={match.bestOffer.url} target="_blank" rel="noreferrer">
                  Buy at {match.bestOffer.retailer}
                </a>
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
