export interface ServiceItem {
  name: string;
  href: string;
  description?: string;
  icon?: string;
  siteMonitor?: string;
  // New: Optional field to specify a service type for special handling
  type?: "qbittorrent"; 
}

export interface ServiceCategory {
  name: string;
  services: ServiceItem[];
}

export type HealthMethod = "get" | "head" | "auto";

export interface HealthCheckResult {
  ok: boolean;
  status?: number;
  elapsedMs: number;
  method?: string;
  error?: string;
}

export interface ServicesResponse {
  categories: ServiceCategory[];
  updatedAt?: string;
}

// --- qBittorrent Specific Types ---
export interface QBittorrentGlobalTransferInfo {
  dl_info_speed: number; // Global download speed in bytes/second
  up_info_speed: number; // Global upload speed in bytes/second
  dl_info_data: number;  // Total downloaded data in bytes
  up_info_data: number;  // Total uploaded data in bytes
  // Other fields can be added if needed
}

export interface QBittorrentTorrent {
  name: string;
  hash: string;
  progress: number; // 0.0 to 1.0
  dlspeed: number;  // Download speed of this torrent
  upspeed: number;  // Upload speed of this torrent
  state: string;    // E.g., "downloading", "pausedUP", "stalledDL"
  // Many other fields are available but not used for basic status
}

export interface QBittorrentStatus {
  globalTransferInfo: QBittorrentGlobalTransferInfo;
  torrents: QBittorrentTorrent[];
  // Optionally include an error message if fetching fails
  error?: string;
}

// --- System Monitor Types ---
export interface DiskUsage {
  fs: string;
  mount: string;
  type: string;
  size: number;
  used: number;
  use: number; // percentage
}

export interface SystemStatus {
  cpu: {
    currentLoad: number; // percentage
    temperature?: number;
  };
  mem: {
    total: number;
    used: number;
    active: number;
    available: number;
  };
  fs: DiskUsage[];
  error?: string;
}

