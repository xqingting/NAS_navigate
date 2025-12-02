import { 
  LayoutDashboard, 
  Server, 
  Database, 
  Download, 
  Cloud, 
  Image, 
  BookOpen, 
  Play, 
  Settings, 
  Globe,
  Box,
  Terminal,
  Wifi,
  Circle,
  HardDrive,
  Zap,
  Activity,
  Cpu,
  Home,
  FolderOpen,
  Radio,
  CalendarCheck,
  Router,
  Gamepad2
} from "lucide-react";
import { cn } from "../lib/utils";

// 定义图标映射，包含组件和推荐颜色
interface IconConfig {
  component: React.ElementType;
  color?: string;
}

const iconMapping: Record<string, IconConfig> = {
  // NAS & 管理
  "casaos": { component: Home, color: "text-emerald-400" },
  "panel": { component: LayoutDashboard, color: "text-blue-400" },
  "1panel": { component: LayoutDashboard, color: "text-blue-400" },
  "home-assistant": { component: Activity, color: "text-sky-400" },
  
  // 下载
  "qbittorrent": { component: Download, color: "text-blue-500" },
  "thunder": { component: Zap, color: "text-yellow-400" },
  "quark": { component: Cloud, color: "text-purple-400" },
  "icloud": { component: Cloud, color: "text-sky-300" },
  
  // 影音
  "emby": { component: Play, color: "text-green-400" },
  "komga": { component: BookOpen, color: "text-orange-400" },
  "plex": { component: Play, color: "text-amber-500" },
  "jellyfin": { component: Play, color: "text-purple-500" },
  
  // 自动化
  "anime": { component: Radio, color: "text-pink-400" },
  "autobangumi": { component: Radio, color: "text-pink-400" },
  "qinglong": { component: Terminal, color: "text-slate-300" },
  "bookmark": { component: CalendarCheck, color: "text-red-400" },
  "qd": { component: CalendarCheck, color: "text-red-400" },
  
  // 工具
  "steam": { component: Gamepad2, color: "text-indigo-400" },
  "asf": { component: Gamepad2, color: "text-indigo-400" },
  "folder-shared": { component: FolderOpen, color: "text-yellow-300" },
  "openlist": { component: FolderOpen, color: "text-yellow-300" },
  
  // 网络
  "proxy": { component: Router, color: "text-teal-400" },
  "mihomo": { component: Router, color: "text-teal-400" },
  "router": { component: Router, color: "text-teal-400" },
  
  // 默认
  "default": { component: Box, color: "text-slate-400" },
};

interface ServiceIconProps {
  icon?: string;
  className?: string;
}

export const ServiceIcon = ({ icon, className }: ServiceIconProps) => {
  if (!icon) return <Box className={cn("text-slate-600", className)} />;

  // 简单的标准化处理：移除前缀 (logos:, mdi: 等)，转小写
  const normalizedKey = icon.toLowerCase().split(':').pop() || icon.toLowerCase();
  
  // 查找配置，支持模糊匹配（简单的包含关系）
  let config = iconMapping[normalizedKey];
  
  // 如果没有直接匹配，尝试查找是否包含 key
  if (!config) {
    const foundKey = Object.keys(iconMapping).find(k => normalizedKey.includes(k));
    if (foundKey) {
      config = iconMapping[foundKey];
    }
  }

  const { component: IconComponent, color } = config || iconMapping["default"];

  return (
    <IconComponent 
      className={cn(
        // 如果传入的 className 里没有指定 text 颜色，则使用默认颜色
        !className?.includes("text-") && color,
        className
      )} 
    />
  );
};

