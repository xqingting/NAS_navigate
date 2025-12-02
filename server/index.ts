import fs from "fs";
import path from "path";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { CLIENT_DIST, HOST, PORT, SERVICES_PATH } from "./config";
import { checkHealth, isHttpUrl } from "./health";
import { loadServices } from "./services";
import { HealthMethod } from "./types";

const server = Fastify({ logger: true });

server.register(fastifyCors, { origin: true });

server.get("/api/services", async (_, reply) => {
  try {
    const data = await loadServices(SERVICES_PATH);
    reply.send(data);
  } catch (error) {
    server.log.error(error);
    reply.code(500).send({
      error: "无法读取 services.yaml",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

server.get("/api/health", async (request, reply) => {
  const query = request.query as { url?: string; method?: HealthMethod };
  if (!query.url) {
    reply.code(400).send({ error: "缺少 url 参数" });
    return;
  }

  let decodedUrl = query.url;
  try {
    decodedUrl = decodeURIComponent(query.url);
  } catch (error) {
    // keep original when decode fails
  }

  decodedUrl = decodedUrl.trim();
  if (!isHttpUrl(decodedUrl)) {
    reply.code(400).send({ error: "仅支持 http/https 地址" });
    return;
  }

  const method: HealthMethod =
    query.method === "get" || query.method === "head" ? query.method : "auto";

  const result = await checkHealth(decodedUrl, method);
  reply.send({
    target: decodedUrl,
    ...result,
  });
});

server.register(fastifyStatic, { root: CLIENT_DIST, prefix: "/" });

const hasClientBuild = () =>
  fs.existsSync(path.join(CLIENT_DIST, "index.html"));

server.setNotFoundHandler((request, reply) => {
  const wantsPage =
    request.raw.method === "GET" && !request.raw.url?.startsWith("/api");

  if (wantsPage && hasClientBuild()) {
    reply.sendFile("index.html");
    return;
  }

  reply.code(404).send({ error: "Not Found" });
});

const start = async () => {
  try {
    await server.listen({ port: PORT, host: HOST });
    server.log.info(
      `Server running at http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`
    );
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

start();
