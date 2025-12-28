import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import { ServiceCategory, ServiceItem } from "./types";

export interface ServicesResponse {
  categories: ServiceCategory[];
  updatedAt?: string;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeService = (value: unknown): ServiceItem | null => {
  if (!isPlainObject(value)) {
    return null;
  }

  const entries = Object.entries(value);
  if (entries.length === 0) {
    return null;
  }

  const [name, details] = entries[0];
  if (!isPlainObject(details)) {
    return null;
  }

  const href = typeof details.href === "string" ? details.href : null;
  if (!href) {
    return null;
  }

  const description =
    typeof details.description === "string" ? details.description : undefined;
  const icon = typeof details.icon === "string" ? details.icon : undefined;
  const siteMonitor =
    typeof details.siteMonitor === "string" ? details.siteMonitor : undefined;
  const type = typeof details.type === "string" ? (details.type as "qbittorrent") : undefined; // Allow service type

  return {
    name: name.trim(),
    href,
    description,
    icon,
    siteMonitor,
    type, // Include type in the returned object
  };
};

export const loadServices = async (
  configPath: string
): Promise<ServicesResponse> => {
  const resolvedPath = path.resolve(configPath);
  const [raw, stats] = await Promise.all([
    fs.readFile(resolvedPath, "utf8"),
    fs.stat(resolvedPath),
  ]);

  const parsed = yaml.load(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("services.yaml 格式需要是分类列表");
  }

  const categories: ServiceCategory[] = [];

  for (const entry of parsed) {
    if (!isPlainObject(entry)) {
      continue;
    }

    for (const [categoryName, servicesRaw] of Object.entries(entry)) {
      if (!Array.isArray(servicesRaw)) {
        continue;
      }

      const services: ServiceItem[] = [];
      for (const serviceRaw of servicesRaw) {
        const service = normalizeService(serviceRaw);
        if (service) {
          services.push(service);
        }
      }

      if (services.length > 0) {
        categories.push({
          name: categoryName.trim(),
          services,
        });
      }
    }
  }

  if (categories.length === 0) {
    throw new Error("services.yaml 解析结果为空");
  }

  return {
    categories,
    updatedAt: stats.mtime.toISOString(),
  };
};
