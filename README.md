# NAS 导航页

基于 Fastify + Vite (React + Tailwind) 的自托管服务导航页面，读取 `config/services.yaml` 生成分组卡片，通过后端代理做健康检查，并内置 qBittorrent 状态取数。

## 功能特性
- 双视图切换：列表仪表盘 / 星云气泡图，支持拖拽缩放。
- 即时搜索（名称/描述/链接模糊匹配），本地访问次数用于星云排序。
- 后端代理健康检查（HEAD 优先，回退 GET），徽标展示在线/异常/检测中。
- qBittorrent 专用卡片（`type: qbittorrent`）：展示上传/下载速度、活跃任务。
- 玻璃拟态暗色界面，悬浮 3D 卡片交互，响应式布局。

## 目录结构
```
config/services.yaml  # 服务列表配置
server/               # Fastify API + 静态文件服务 + qBittorrent 取数
src/                  # React 前端
dist/client           # 前端构建产物（vite build）
dist/server           # 后端编译产物（tsc -p tsconfig.server.json）
```

## 快速开始（开发模式）
前置：Node.js 18+

1. 安装依赖
   ```bash
   npm install
   ```
2. 配置服务列表  
   - 默认读取 `config/services.yaml`。  
   - 需要健康检查请填写 `siteMonitor`（建议与实际访问地址一致）。  
   - qBittorrent 卡片需添加 `type: qbittorrent`，并确保 `siteMonitor` 指向其 Web UI。
3. 启动后端（终端 A）
   ```bash
   # 可在命令前临时覆盖账号密码
   QB_USERNAME=admin QB_PASSWORD=qingting npm run dev:server
   ```
4. 启动前端（终端 B）
   ```bash
   npm run dev:client
   ```
5. 浏览器访问 http://localhost:5173

## 构建与部署

### Docker 部署（推荐，特别是 NAS）
推荐使用新版 Docker Compose 指令（V2）：
```bash
docker compose up -d --build
```
> **注意**：如果您使用的是旧版 Docker 环境，可能需要使用 `docker-compose up -d --build`。如果提示命令未找到，请尝试带空格的 `docker compose`。

### 源码部署
```bash
npm run build      # 构建前后端
npm start          # 使用 dist 产物启动（默认端口 3000）
```
- 后端会从 `dist/client` 提供静态资源并挂载 API。
- 如需仅构建某端，使用 `npm run build:client` 或 `npm run build:server`。

## API 说明
- `GET /api/services` → `{ categories: [...], updatedAt: string }`
- `GET /api/health?url=<encoded>&method=auto|head|get`
  - 返回：`target, ok, status, elapsedMs, method, error?`
- `GET /api/qbittorrent/status?baseUrl=<encoded>`
  - 返回：`globalTransferInfo, torrents[], error?`

## 环境变量
| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `HOST` | `0.0.0.0` | 监听地址 |
| `PORT` | `3000` | 监听端口 |
| `SERVICES_PATH` | `config/services.yaml` | 服务配置路径 |
| `CLIENT_DIST` | `dist/client` | 前端静态资源目录 |
| `HEALTH_TIMEOUT_MS` | `4000` | 健康检查超时（毫秒） |
| `QB_USERNAME` | `admin` | qBittorrent 账号 |
| `QB_PASSWORD` | `admin` | qBittorrent 密码 |
| `QB_TIMEOUT_MS` | `5000` | qBittorrent 请求超时（毫秒） |

## 健康检查 & qBittorrent 提示
- 仅对配置了 `siteMonitor` 的服务执行检查；401/403 视为可达。
- qBittorrent 状态通过 `siteMonitor` 轮询；账号密码需与 Web UI 保持一致。
- 内网地址需在当前网络可访问，否则状态会显示异常。

## 常见问题
- **页面加载不到服务**：确认 `config/services.yaml` 保持“列表 → 分类 → 服务”层级。
- **健康检查全部异常**：检查内网可达性、防火墙或反代；必要时调高 `HEALTH_TIMEOUT_MS`。
- **qBittorrent 卡片无数据**：检查 `type: qbittorrent`、`siteMonitor`、账号密码或 `QB_TIMEOUT_MS`。 
