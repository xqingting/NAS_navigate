import React from "react";
import { useSystemMonitor } from "../hooks/useSystemMonitor";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, HardDrive, Server } from "lucide-react";

const ProgressBar = ({
  value,
  colorClass = "bg-blue-500",
}: {
  value: number;
  colorClass?: string;
}) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700/50">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.5 }}
      className={clsx("h-full rounded-full", colorClass)}
    />
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  percent,
  warnThreshold = 80,
  dangerThreshold = 90,
}: {
  icon: any;
  label: string;
  value: string;
  subtext: string;
  percent: number;
  warnThreshold?: number;
  dangerThreshold?: number;
}) => {
  let color = "bg-emerald-500";
  if (percent > dangerThreshold) color = "bg-red-500";
  else if (percent > warnThreshold) color = "bg-amber-500";

  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-lg font-bold text-gray-100">{value}</span>
        <span className="text-xs text-gray-500 mb-1">{subtext}</span>
      </div>
      <ProgressBar value={percent} colorClass={color} />
    </div>
  );
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const SystemMonitor = () => {
  const { status, loading, error } = useSystemMonitor();

  if (loading || !status || error) return null;

  const { cpu, mem, fs } = status;

  const memPercent = (mem.active / mem.total) * 100;
  
  // Sort disks by size descending to show most important ones
  const mainDisks = [...fs].sort((a, b) => b.size - a.size).slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto mb-6 px-4 sm:px-6"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md shadow-xl">
        {/* CPU */}
        <StatCard
          icon={Cpu}
          label="CPU Load"
          value={`${cpu.currentLoad.toFixed(1)}%`}
          subtext={cpu.temperature ? `${cpu.temperature}°C` : "N/A"}
          percent={cpu.currentLoad}
        />

        {/* RAM */}
        <StatCard
          icon={Server}
          label="Memory"
          value={formatBytes(mem.active)}
          subtext={`/ ${formatBytes(mem.total)}`}
          percent={memPercent}
        />

        {/* Disks - Show up to 2 */}
        {mainDisks.map((disk) => (
          <StatCard
            key={disk.mount}
            icon={HardDrive}
            label={`Disk (${disk.mount})`}
            value={formatBytes(disk.used)}
            subtext={`/ ${formatBytes(disk.size)}`}
            percent={disk.use}
          />
        ))}
      </div>
    </motion.div>
  );
};
