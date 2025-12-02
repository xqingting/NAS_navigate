import path from "path";

export const PORT = Number(process.env.PORT) || 3000;
export const HOST = process.env.HOST || "0.0.0.0";

export const SERVICES_PATH =
  process.env.SERVICES_PATH ||
  path.resolve(process.cwd(), "config/services.yaml");

export const CLIENT_DIST =
  process.env.CLIENT_DIST || path.resolve(process.cwd(), "dist/client");
