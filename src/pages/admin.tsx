import { FormEvent, useEffect, useState } from "react";

type BootRow = {
  id: string;
  canonicalName: string;
  lastMm: number | null;
  volumeClass: string | null;
  flexIndex: number | null;
};

type BootsResponse = { count: number; boots: BootRow[] };

export default function AdminPage() {
  const [data, setData] = useState<BootsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [aliasBootId, setAliasBootId] = useState("");
  const [aliasValue, setAliasValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/boots");
    const json = (await res.json()) as BootsResponse;
    setData(json);
  };

  useEffect(() => {
    load();
  }, []);

  const seed = async () => {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/seed", { method: "POST" });
    if (res.ok) {
      setMessage("Seeded successfully.");
      await load();
    } else {
      setMessage("Seed failed.");
    }
    setLoading(false);
  };

  const addAlias = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const res = await fetch("/api/admin/alias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bootId: aliasBootId, alias: aliasValue })
    });
    if (res.ok) {
      setMessage("Alias saved.");
      setAliasValue("");
    } else {
      setMessage("Alias failed.");
    }
  };

  return (
    <main>
      <h1>Admin</h1>
      <p className="notice">Seed the database and manage aliases.</p>
      <button className="button" onClick={seed} disabled={loading}>
        {loading ? "Seeding..." : "Seed database"}
      </button>
      {message && <p className="notice">{message}</p>}

      <section className="card" style={{ marginTop: 24 }}>
        <h2>Boots</h2>
        <p className="notice">Total: {data?.count ?? 0}</p>
        <table className="table">
          <thead>
            <tr>
              <th>Boot</th>
              <th>Last</th>
              <th>Volume</th>
              <th>Flex</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {(data?.boots || []).slice(0, 20).map((boot) => (
              <tr key={boot.id}>
                <td>{boot.canonicalName}</td>
                <td>{boot.lastMm ?? "-"}</td>
                <td>{boot.volumeClass ?? "-"}</td>
                <td>{boot.flexIndex ?? "-"}</td>
                <td>{boot.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>Add alias</h2>
        <form onSubmit={addAlias} className="input-row">
          <input
            value={aliasBootId}
            onChange={(e) => setAliasBootId(e.target.value)}
            placeholder="Boot ID"
          />
          <input
            value={aliasValue}
            onChange={(e) => setAliasValue(e.target.value)}
            placeholder="Alias"
          />
          <button className="button" type="submit">
            Add alias
          </button>
        </form>
      </section>
    </main>
  );
}
