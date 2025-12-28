import { useState, useEffect } from "react";
import { SystemStatus } from "../types";
import { API_BASE_URL } from "../api";

export function useSystemMonitor(refreshInterval = 5000) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/system/status`);
        if (!res.ok) {
          throw new Error(`Status check failed: ${res.status}`);
        }
        const data: SystemStatus = await res.json();
        if (isMounted) {
          setStatus(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStatus();
    const timer = setInterval(fetchStatus, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [refreshInterval]);

  return { status, loading, error };
}
