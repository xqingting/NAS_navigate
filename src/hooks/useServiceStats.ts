import { useState, useEffect } from 'react';

interface ServiceStats {
  [href: string]: number;
}

export function useServiceStats() {
  const [stats, setStats] = useState<ServiceStats>({});

  useEffect(() => {
    const stored = localStorage.getItem('nas-nav-stats');
    if (stored) {
      try {
        setStats(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stats', e);
      }
    }
  }, []);

  const recordVisit = (href: string) => {
    setStats(prev => {
      const next = { ...prev, [href]: (prev[href] || 0) + 1 };
      localStorage.setItem('nas-nav-stats', JSON.stringify(next));
      return next;
    });
  };

  const getVisits = (href: string) => stats[href] || 0;

  return { stats, recordVisit, getVisits };
}
