import axios from "axios";
import { HealthCheckResult, HealthMethod } from "./types";

const DEFAULT_TIMEOUT = Number(process.env.HEALTH_TIMEOUT_MS) || 4000;

const attempt = async (url: string, method: "head" | "get") => {
  const startedAt = Date.now();

  try {
    const response = await axios({
      url,
      method,
      timeout: DEFAULT_TIMEOUT,
      validateStatus: () => true,
    });

    return {
      ok: response.status < 400,
      status: response.status,
      elapsedMs: Date.now() - startedAt,
      method,
    } as HealthCheckResult;
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      return {
        ok: false,
        status,
        elapsedMs,
        method,
        error: error.message,
      } as HealthCheckResult;
    }

    return {
      ok: false,
      elapsedMs,
      method,
      error: "health check failed",
    } as HealthCheckResult;
  }
};

export const checkHealth = async (
  url: string,
  method: HealthMethod = "auto"
): Promise<HealthCheckResult> => {
  if (method === "get" || method === "head") {
    return attempt(url, method);
  }

  const headResult = await attempt(url, "head");
  if (
    headResult.ok ||
    headResult.status === 401 ||
    headResult.status === 403
  ) {
    return headResult;
  }

  const getResult = await attempt(url, "get");
  if (getResult.ok) {
    return getResult;
  }

  return {
    ...getResult,
    error: getResult.error || headResult.error,
  };
};

export const isHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
};
