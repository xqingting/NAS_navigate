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

export interface ServicesResponse {
  categories: ServiceCategory[];
  updatedAt?: string;
}

export type HealthState =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "up"; status?: number; elapsedMs?: number }
  | { state: "down"; status?: number; error?: string };
