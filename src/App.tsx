import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Atom,
  Bookmark,
  BookOpen,
  Circle,
  Clapperboard,
  Cloud,
  FolderOpen,
  Gamepad2,
  Globe2,
  Home,
  Leaf,
  LayoutDashboard,
  Loader2,
  Magnet,
  Network,
  RefreshCcw,
  Search,
  Signal,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { fetchHealth, fetchServices } from "./api";
import { HealthState, ServiceCategory, ServiceItem } from "./types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  casaos: Home,
  panel: LayoutDashboard,
  "home-assistant": Sparkles,
  qbittorrent: Magnet,
  thunder: Zap,
  quark: Atom,
  icloud: Cloud,
  emby: Clapperboard,
  komga: BookOpen,
  anime: Sparkles,
  qinglong: Leaf,
  bookmark: Bookmark,
  steam: Gamepad2,
  "folder-shared": FolderOpen,
  proxy: Network,
};

const getIcon = (value?: string) => {
  if (!value) return Circle;
  const normalized = value.toLowerCase();
  return iconMap[normalized] || Circle;
};

const hostFromUrl = (href: string) => {
  try {
    const url = new URL(href);
    return url.host;
  } catch (error) {
    return href;
  }
};

const StatusBadge = ({
  health,
}: {
  health: HealthState;
}): JSX.Element => {
  const state = health.state;
  const map = {
    idle: {
      text: "未检测",
      className: "border-white/10 text-slate-300 bg-white/5",
      dot: "bg-slate-400",
    },
    checking: {
      text: "检查中",
      className: "border-amber-500/40 text-amber-100 bg-amber-500/10",
      dot: "bg-amber-400",
    },
    up: {
      text: "在线",
      className: "border-emerald-500/40 text-emerald-100 bg-emerald-500/10",
      dot: "bg-emerald-400",
    },
    down: {
      text: "异常",
      className: "border-rose-500/40 text-rose-100 bg-rose-500/10",
      dot: "bg-rose-400",
    },
  } as const;

  const style = map[state];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${style.className}`}
    >
      {state === "checking" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
      )}
      <span>{style.text}</span>
      {"status" in health && health.status && (
        <span className="text-[10px] text-white/70">({health.status})</span>
      )}
    </span>
  );
};

const ServiceCard = ({
  service,
  health,
  onRecheck,
}: {
  service: ServiceItem;
  health: HealthState;
  onRecheck: () => void;
}) => {
  const Icon = getIcon(service.icon);
  const showRetry = !!service.siteMonitor;

  return (
    <motion.a
      href={service.href}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group relative block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/20 hover:shadow-glow"
    >
      <div className="card-sheen absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-accent/30 blur-xl opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-accent ring-1 ring-white/10">
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-white">{service.name}</p>
            {service.description && (
              <p className="text-sm text-slate-400 line-clamp-2">
                {service.description}
              </p>
            )}
          </div>
        </div>
        <StatusBadge health={health} />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span className="inline-flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-accent" />
          {hostFromUrl(service.href)}
        </span>
        {showRetry && (
          <button
            onClick={(event) => {
              event.preventDefault();
              onRecheck();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] text-slate-200 transition hover:border-accent/50 hover:text-white"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            重新检测
          </button>
        )}
      </div>
    </motion.a>
  );
};

const CategorySection = ({
  category,
  healthMap,
  onRecheck,
}: {
  category: ServiceCategory;
  healthMap: Record<string, HealthState>;
  onRecheck: (service: ServiceItem) => void;
}) => (
  <section className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_6px_rgba(34,211,238,0.18)]" />
        <h2 className="text-xl font-semibold text-white">{category.name}</h2>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300">
          {category.services.length} 个服务
        </span>
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {category.services.map((service) => (
        <ServiceCard
          key={`${category.name}-${service.name}-${service.href}`}
          service={service}
          health={healthMap[service.href] || { state: "idle" }}
          onRecheck={() => onRecheck(service)}
        />
      ))}
    </div>
  </section>
);

const SkeletonCard = () => (
  <div className="h-[140px] rounded-2xl border border-white/5 bg-white/5">
    <div className="h-full w-full animate-pulse rounded-2xl bg-gradient-to-br from-white/5 to-white/10" />
  </div>
);

const formatTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-CN", { hour12: false });
};

function App() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [healthMap, setHealthMap] = useState<Record<string, HealthState>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined);

  useEffect(() => {
    load();
  }, []);

  const totalServices = useMemo(
    () => categories.reduce((sum, c) => sum + c.services.length, 0),
    [categories]
  );

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return categories;

    return categories
      .map((category) => {
        const services = category.services.filter((service) => {
          const text = `${service.name} ${service.description || ""}`.toLowerCase();
          return text.includes(keyword);
        });

        return { ...category, services };
      })
      .filter((category) => category.services.length > 0);
  }, [categories, search]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchServices();
      setCategories(data.categories);
      setUpdatedAt(data.updatedAt);
      bootstrapHealth(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const bootstrapHealth = (data: ServiceCategory[]) => {
    const nextHealth: Record<string, HealthState> = {};
    data.forEach((category, catIndex) => {
      category.services.forEach((service, serviceIndex) => {
        if (!service.siteMonitor) {
          nextHealth[service.href] = { state: "idle" };
          return;
        }

        const delay = (catIndex * 6 + serviceIndex) * 120;
        nextHealth[service.href] = { state: "checking" };
        setTimeout(() => runHealthCheck(service), delay);
      });
    });

    if (Object.keys(nextHealth).length > 0) {
      setHealthMap((prev) => ({ ...prev, ...nextHealth }));
    }
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
          : {
              state: "down",
              status: result.status,
              error: result.error || "无法访问",
            },
      }));
    } catch (err) {
      setHealthMap((prev) => ({
        ...prev,
        [service.href]: {
          state: "down",
          error: err instanceof Error ? err.message : "检查失败",
        },
      }));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-midnight">
      <div className="glow" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.05),transparent_25%),radial-gradient(circle_at_80%_0,rgba(255,255,255,0.04),transparent_22%)]" />

      <main className="relative mx-auto max-w-6xl px-6 pb-16 pt-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-sky-200">
              <Shield className="h-4 w-4" />
              自托管服务导航
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-white md:text-4xl">
                NAS 导航中心
              </h1>
              <p className="mt-2 max-w-2xl text-slate-400">
                快速定位常用面板、下载、影音与自动化服务。支持即时搜索与后端健康检查，避免跨域限制。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                {totalServices} 个服务
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1">
                <Signal className="h-3.5 w-3.5 text-amber-300" />
                实时健康检测
              </span>
              {updatedAt && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1">
                  <ClockIcon className="h-3.5 w-3.5 text-slate-300" />
                  更新于 {formatTime(updatedAt)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-accent/40 hover:text-accent"
            >
              <RefreshCcw className="h-4 w-4" />
              重新加载
            </button>
          </div>
        </header>

        <section className="mt-8 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="group relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="输入关键词，瞬间筛选服务..."
                  className="w-full rounded-full border border-white/10 bg-white/5 px-12 py-3 text-sm text-white outline-none transition focus:border-accent/50 focus:bg-white/10"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-300"
                  >
                    清除
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                即时搜索会在分类与描述中匹配关键词，不区分大小写。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <Legend color="bg-emerald-400" label="在线" />
              <Legend color="bg-rose-400" label="异常" />
              <Legend color="bg-amber-400" label="检查中" />
              <Legend color="bg-slate-400" label="未检测" />
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-8">
          {loading && (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              加载失败：{error}
            </div>
          )}

          {!loading && !error && filteredCategories.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-12 text-center text-slate-300">
              未找到匹配的服务，请更换关键词。
            </div>
          )}

          {!loading &&
            !error &&
            filteredCategories.map((category) => (
              <CategorySection
                key={category.name}
                category={category}
                healthMap={healthMap}
                onRecheck={runHealthCheck}
              />
            ))}
        </section>
      </main>
    </div>
  );
}

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
    <span>{label}</span>
  </span>
);

const ClockIcon = (props: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

export default App;
