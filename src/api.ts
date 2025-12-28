import { ServicesResponse } from "./types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE || "/api";

export interface HealthResponse {
  target: string;
  ok: boolean;
  status?: number;
  elapsedMs: number;
  method: "head" | "get";
  error?: string;
}

export const fetchServices = async (): Promise<ServicesResponse> => {
  const response = await fetch(`${API_BASE_URL}/services`);
  if (!response.ok) {
    throw new Error("加载服务列表失败");
  }

  return (await response.json()) as ServicesResponse;
};

export const fetchHealth = async (url: string): Promise<HealthResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/health?url=${encodeURIComponent(url)}`
  );

  if (!response.ok) {
    throw new Error("健康检查失败");
  }

  return (await response.json()) as HealthResponse;
};

export const fetchLogPreview = async (logId: string): Promise<{ content: string }> => {
  const response = await fetch(`${API_BASE_URL}/log-preview?logId=${encodeURIComponent(logId)}`);
  if (!response.ok) {
    throw new Error("加载日志预览失败");
  }
  return (await response.json()) as { content: string };
};
