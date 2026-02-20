import React from "react";

interface ServerStatus {
  message: string;
  version: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function useServerStatus() {
  const [data, setData] = React.useState<ServerStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    fetch(`${API_URL}/api/status`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ServerStatus>;
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
