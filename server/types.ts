export interface ServiceItem {
  name: string;
  href: string;
  description?: string;
  icon?: string;
  siteMonitor?: string;
}

export interface ServiceCategory {
  name: string;
  services: ServiceItem[];
}

export type HealthMethod = "auto" | "head" | "get";

export interface HealthCheckResult {
  ok: boolean;
  status?: number;
  elapsedMs: number;
  method: "head" | "get";
  error?: string;
}
