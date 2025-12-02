import { ServicesResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export interface HealthResponse {
  target: string;
  ok: boolean;
  status?: number;
  elapsedMs: number;
  method: "head" | "get";
  error?: string;
}

export const fetchServices = async (): Promise<ServicesResponse> => {
  const response = await fetch(`${API_BASE}/api/services`);
  if (!response.ok) {
    throw new Error("加载服务列表失败");
  }

  return (await response.json()) as ServicesResponse;
};

export const fetchHealth = async (url: string): Promise<HealthResponse> => {
  const response = await fetch(
    `${API_BASE}/api/health?url=${encodeURIComponent(url)}`
  );

  if (!response.ok) {
    throw new Error("健康检查失败");
  }

  return (await response.json()) as HealthResponse;
};
