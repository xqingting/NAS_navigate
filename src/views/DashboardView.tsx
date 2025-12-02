import { motion, AnimatePresence } from "framer-motion";
import { ServiceCategory, ServiceItem, HealthState, QBittorrentStatus } from "../types";
import { SearchBar } from "../components/SearchBar";
import { ServiceCard } from "../components/ServiceCard";
import { useServiceStats } from "../hooks/useServiceStats";
import { useEffect, useMemo, useState } from "react";

interface DashboardViewProps {
  categories: ServiceCategory[];
  healthMap: Record<string, HealthState>;
  onRecheck: (service: ServiceItem) => void;
  loading: boolean;
  onVisit: (href: string) => void;
}

const QB_STATUS_INTERVAL_MS = 5000; // Refresh qBittorrent status every 5 seconds

export function DashboardView({ categories, healthMap, onRecheck, loading, onVisit }: DashboardViewProps) {
  const [search, setSearch] = useState("");
  const [qbittorrentStatusMap, setQbittorrentStatusMap] = useState<Record<string, QBittorrentStatus>>({});

  useEffect(() => {
    // Identify qBittorrent services and set up polling
    const qbittorrentServices = categories.flatMap(c => c.services).filter(s => s.type === "qbittorrent");
    const intervals: NodeJS.Timeout[] = [];

    const fetchQBittorrentStatus = async (service: ServiceItem) => {
      if (!service.siteMonitor) return;
      try {
        const response = await fetch(`/api/qbittorrent/status?baseUrl=${encodeURIComponent(service.siteMonitor)}`);
        const data: QBittorrentStatus = await response.json();
        setQbittorrentStatusMap(prev => ({
          ...prev,
          [service.href]: data
        }));
      } catch (error) {
        console.error(`Failed to fetch qBittorrent status for ${service.name}:`, error);
        setQbittorrentStatusMap(prev => ({
          ...prev,
          [service.href]: {
            globalTransferInfo: { dl_info_speed: 0, up_info_speed: 0, dl_info_data: 0, up_info_data: 0 },
            torrents: [],
            error: "无法获取状态",
          }
        }));
      }
    };

    qbittorrentServices.forEach(service => {
      // Initial fetch
      fetchQBittorrentStatus(service);
      // Set up interval polling
      const interval = setInterval(() => fetchQBittorrentStatus(service), QB_STATUS_INTERVAL_MS);
      intervals.push(interval);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [categories]); // Re-run if categories change

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return categories;

    return categories
      .map((category) => {
        const services = category.services.filter((service) => {
          const text = `${service.name} ${service.description || ""} ${service.href}`.toLowerCase();
          return text.includes(keyword);
        });
        return { ...category, services };
      })
      .filter((category) => category.services.length > 0);
  }, [categories, search]);

  return (
    <div className="relative mx-auto max-w-7xl px-6 pb-20">
      <div className="sticky top-4 z-50 mb-12">
         <div className="absolute inset-0 -m-4 bg-gradient-to-b from-[#0b0f19] via-[#0b0f19]/80 to-transparent blur-xl pointer-events-none" />
         <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className="space-y-16">
        {loading ? (
           <div className="flex justify-center py-20 text-white/30 animate-pulse">
             Loading Services...
           </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredCategories.map((category, catIndex) => (
              <motion.section
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 px-2">
                  <h2 className="text-2xl font-bold text-white/90 tracking-tight">
                    {category.name}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="text-xs font-mono text-white/30">
                    {category.services.length} APPS
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.services.map((service) => (
                    <div key={service.href} onClick={() => onVisit(service.href)}>
                      <ServiceCard
                        service={service}
                        health={healthMap[service.href] || { state: "idle" }}
                        qbittorrentStatus={qbittorrentStatusMap[service.href]} // Pass qBittorrent status
                        onRecheck={() => onRecheck(service)}
                      />
                    </div>
                  ))}
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
        )}
        
        {!loading && filteredCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🦖</div>
            <h3 className="text-xl font-bold text-white">No services found</h3>
            <p className="text-white/40 mt-2">Try searching for something else.</p>
          </div>
        )}
      </div>
    </div>
  );
}
