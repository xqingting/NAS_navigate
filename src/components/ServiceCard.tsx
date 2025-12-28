import { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ExternalLink, FileText } from "lucide-react"; // Import FileText for the log button
import { HealthState, ServiceItem, QBittorrentStatus } from "../types";
import { ServiceIcon } from "./ServiceIcon";
import { StatusBadge } from "./ui/badge";
import { cn } from "../lib/utils";
import { LogViewerModal } from "./LogViewerModal"; // Import LogViewerModal
import { fetchLogPreview } from "../api"; // Import fetchLogPreview

interface ServiceCardProps {
  service: ServiceItem;
  health: HealthState;
  onRecheck: () => void;
  qbittorrentStatus?: QBittorrentStatus;
}

// Utility function to format bytes per second
const formatBytesPerSecond = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B/s`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB/s`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB/s`;
  }
};

export const ServiceCard = ({ service, health, onRecheck, qbittorrentStatus }: ServiceCardProps) => {
  const hostName = new URL(service.href).host;
  const ref = useRef<HTMLDivElement>(null);
  const [showLogModal, setShowLogModal] = useState(false); // State for log modal visibility

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Mouse position relative to center of card (0-1)
  const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);
  
  // Glare effect opacity and position
  const glareOpacity = useTransform(mouseY, [-0.5, 0.5], [0, 0.4]);
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  function onMouseMove({ clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const xPos = (clientX - left) / width - 0.5;
    const yPos = (clientY - top) / height - 0.5;
    
    mouseX.set(xPos);
    mouseY.set(yPos);
    x.set(clientX - left);
    y.set(clientY - top);
  }

  function onMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    x.set(0);
    y.set(0);
  }

  const getStatusVariant = (state: HealthState["state"]) => {
    switch (state) {
      case "up": return "success";
      case "down": return "error";
      case "checking": return "warning";
      default: return "neutral";
    }
  };

  const getStatusText = (health: HealthState) => {
    if (health.state === "up") return `${health.elapsedMs || "?"}ms`;
    if (health.state === "down") return health.status ? `Code ${health.status}` : "Offline";
    if (health.state === "checking") return "Checking...";
    return "Unknown";
  };

  const isQBittorrent = service.type === "qbittorrent";
  const activeDownloads = isQBittorrent && qbittorrentStatus 
    ? qbittorrentStatus.torrents.filter(t => t.state === 'downloading').length 
    : 0;
  const downloadSpeed = isQBittorrent && qbittorrentStatus?.globalTransferInfo.dl_info_speed
    ? formatBytesPerSecond(qbittorrentStatus.globalTransferInfo.dl_info_speed)
    : '0 B/s';
  const uploadSpeed = isQBittorrent && qbittorrentStatus?.globalTransferInfo.up_info_speed
    ? formatBytesPerSecond(qbittorrentStatus.globalTransferInfo.up_info_speed)
    : '0 B/s';

  const isRclone = service.icon === "rclone";
  const showRcloneLogButton = isRclone && (health.state === "down" || health.state === "error");


  return (
    <>
      <motion.div
        ref={ref}
        style={{
          perspective: 1000,
        }}
        className="relative h-full"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <motion.a
          href={service.href}
          target="_blank"
          rel="noreferrer"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 transition-all duration-200 ease-out will-change-transform hover:border-white/20"
        >
          {/* 1. 动态流光高光层 (Glare) */}
          <motion.div
            style={{
              opacity: glareOpacity,
              background: useMotionTemplate`radial-gradient(
                circle at ${glareX} ${glareY},
                rgba(255,255,255,0.3),
                transparent 80%
              )`,
            }}
            className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay"
          />
          
          {/* 2. 鼠标跟随光斑 (Spotlight) */}
          <motion.div
            style={{
              background: useMotionTemplate`radial-gradient(
                600px circle at ${x}px ${y}px,
                rgba(56, 189, 248, 0.06),
                transparent 40%
              )`,
            }}
            className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100"
          />

          {/* 内容层 - 增加 z 轴位移实现悬浮感 */}
          <div className="relative z-10 flex items-start justify-between" style={{ transform: "translateZ(20px)" }}>
            <motion.div 
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-3xl text-white shadow-inner ring-1 ring-white/10 backdrop-blur-md"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ServiceIcon icon={service.icon} className="h-8 w-8 drop-shadow-lg" />
            </motion.div>
            
            <div className="flex flex-col items-end gap-2">
               <div className="opacity-0 transition-all duration-300 -translate-y-2 group-hover:translate-y-0 group-hover:opacity-100">
                  <ExternalLink className="h-4 w-4 text-white/30" />
               </div>
            </div>
          </div>

          <div className="relative z-10 mt-6" style={{ transform: "translateZ(30px)" }}>
            <h3 className="text-lg font-bold tracking-tight text-white transition-colors group-hover:text-sky-200">
              {service.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm font-medium text-white/40 group-hover:text-white/60 transition-colors">
              {service.description}
            </p>
          </div>
          
          {isQBittorrent && qbittorrentStatus && (
            <div className="relative z-10 mt-4 space-y-1 text-xs text-white/50" style={{ transform: "translateZ(20px)" }}>
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0">⬇️ {downloadSpeed}</span>
                <span className="flex-shrink-0">⬆️ {uploadSpeed}</span>
              </div>
              {qbittorrentStatus.torrents.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <motion.span
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"
                      />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                    </span>
                    {activeDownloads} 个下载中
                  </span>
              )}
              {qbittorrentStatus.error && (
                <span className="text-rose-400">{qbittorrentStatus.error}</span>
              )}
            </div>
          )}

          <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/5 pt-4" style={{ transform: "translateZ(20px)" }}>
            <span className="text-xs font-mono text-white/30">
              {hostName}
            </span>

            <div className="flex items-center gap-2">
              {showRcloneLogButton && (
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevent navigating to service.href
                    e.stopPropagation(); // Stop event propagation
                    setShowLogModal(true);
                  }}
                  className="flex items-center gap-1 text-xs text-white/50 hover:text-sky-400 transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  日志
                </button>
              )}
              {service.siteMonitor && (
                 <StatusBadge 
                   variant={getStatusVariant(health.state)} 
                   animate={health.state === "checking"}
                   className="cursor-pointer hover:bg-opacity-20"
                 >
                   {getStatusText(health)}
                 </StatusBadge>
              )}
            </div>
          </div>
        </motion.a>
      </motion.div>

      {showLogModal && (
        <LogViewerModal
          logId="rclone-quark-sync"
          onClose={() => setShowLogModal(false)}
          fetchLogContent={fetchLogPreview}
        />
      )}
    </>
  );
};