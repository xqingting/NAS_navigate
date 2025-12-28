import { useEffect, useState } from "react";
import { LayoutGrid, Hexagon } from "lucide-react";
import { motion } from "framer-motion";
import { fetchHealth, fetchServices } from "./api";
import { HealthState, ServiceCategory, ServiceItem } from "./types";
import { Header } from "./components/Header";
import { DashboardView } from "./views/DashboardView";
import { BubbleView } from "./views/BubbleView";
import { SystemMonitor } from "./components/SystemMonitor";
import { SpotlightCursor } from "./components/ui/SpotlightCursor";
import { useServiceStats } from "./hooks/useServiceStats";
import { cn } from "./lib/utils";

type ViewMode = "dashboard" | "bubble";

function App() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [healthMap, setHealthMap] = useState<Record<string, HealthState>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  
  const { stats, recordVisit } = useServiceStats();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchServices();
      setCategories(data.categories);
      bootstrapHealth(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const bootstrapHealth = (data: ServiceCategory[]) => {
    data.forEach((category, catIndex) => {
      category.services.forEach((service, serviceIndex) => {
        if (!service.siteMonitor) return;
        const delay = (catIndex * 5 + serviceIndex) * 200;
        setTimeout(() => runHealthCheck(service), delay);
      });
    });
  };

  const runHealthCheck = async (service: ServiceItem) => {
    if (!service.siteMonitor) return;

    setHealthMap((prev) => ({
      ...prev,
      [service.href]: { state: "checking" },
    }));

    try {
      const result = await fetchHealth(service.siteMonitor);
      setHealthMap((prev) => ({
        ...prev,
        [service.href]: result.ok
          ? { state: "up", status: result.status, elapsedMs: result.elapsedMs }
          : { state: "down", status: result.status, error: result.error },
      }));
    } catch (err) {
      setHealthMap((prev) => ({
        ...prev,
        [service.href]: { state: "down", error: err instanceof Error ? err.message : "Error" },
      }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-aurora overflow-x-hidden selection:bg-sky-500/30">
      <SpotlightCursor />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />
      
      <div className="relative mx-auto max-w-7xl px-6 pb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full flex-1">
             <Header />
          </div>
          
          {/* View Switcher with Elastic Tab Animation */}
          <div className="flex items-center gap-1 rounded-full bg-white/5 p-1.5 border border-white/10 backdrop-blur-md relative z-50">
            {(["dashboard", "bubble"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50",
                  viewMode === mode ? "text-white" : "text-white/40 hover:text-white/70"
                )}
              >
                {viewMode === mode && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-full shadow-inner border border-white/5"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {mode === "dashboard" ? <LayoutGrid className="w-4 h-4" /> : <Hexagon className="w-4 h-4" />}
                  <span>{mode === "dashboard" ? "列表" : "星云"}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <SystemMonitor />

        <div className="mt-8 relative z-10">
          {viewMode === "dashboard" ? (
            <DashboardView 
              categories={categories} 
              healthMap={healthMap} 
              onRecheck={runHealthCheck}
              loading={loading}
              onVisit={recordVisit}
            />
          ) : (
            <BubbleView 
              categories={categories} 
              stats={stats} 
              healthMap={healthMap}
              onVisit={recordVisit}
            />
          )}
        </div>
      </div>
      
      <footer className="py-10 text-center text-xs text-white/20 relative z-10">
        <p>NAS Navigation System &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
