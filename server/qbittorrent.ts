import axios from "axios";
import { QBittorrentGlobalTransferInfo, QBittorrentStatus, QBittorrentTorrent } from "./types";

const QB_TIMEOUT = Number(process.env.QB_TIMEOUT_MS) || 5000;
const QB_USERNAME = process.env.QB_USERNAME || "admin"; // Default or from env
const QB_PASSWORD = process.env.QB_PASSWORD || "admin"; // Default or from env



/**
 * Attempts to log in to qBittorrent Web UI and retrieves a session ID.
 * @param baseUrl Base URL of the qBittorrent Web UI
 * @param username qBittorrent username
 * @param password_str qBittorrent password
 * @returns Session ID (SID) or null if login fails
 */
async function login(baseUrl: string, username: string, password_str: string): Promise<string | null> {
  try {
    const response = await axios.post(
      `${baseUrl}/api/v2/auth/login`,
      new URLSearchParams({ username, password: password_str }).toString(), // Form-urlencoded data
      {
        timeout: QB_TIMEOUT,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    // qBittorrent returns 'Ok.' on success and sets SID in cookie
    // If it fails, it returns "Failed."
    if (response.data === 'Ok.') {
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        const sidCookie = setCookieHeader.find((cookie: string) => cookie.startsWith('SID='));
        if (sidCookie) {
          return sidCookie.split(';')[0].split('=')[1]; // Extract SID value
        }
      }
    }
    console.error(`qBittorrent login failed for ${baseUrl}: ${response.data}`);
    return null;

  } catch (error) {
    console.error(`Failed to log in to qBittorrent at ${baseUrl}:`, axios.isAxiosError(error) ? error.message : String(error));
    return null;
  }
}

/**
 * Fetches global transfer information from qBittorrent.
 * @param baseUrl Base URL of the qBittorrent Web UI
 * @param sid Session ID
 */
async function getGlobalTransferInfo(baseUrl: string, sid: string): Promise<QBittorrentGlobalTransferInfo | null> {
  try {
    const response = await axios.get<QBittorrentGlobalTransferInfo>(
      `${baseUrl}/api/v2/transfer/info`,
      {
        timeout: QB_TIMEOUT,
        headers: { Cookie: `SID=${sid}` }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch qBittorrent global transfer info from ${baseUrl}:`, axios.isAxiosError(error) ? error.message : String(error));
    return null;
  }
}

/**
 * Fetches a simplified list of torrents from qBittorrent.
 * @param baseUrl Base URL of the qBittorrent Web UI
 * @param sid Session ID
 */
async function getTorrents(baseUrl: string, sid: string): Promise<QBittorrentTorrent[] | null> {
  try {
    const response = await axios.get<QBittorrentTorrent[]>(
      `${baseUrl}/api/v2/torrents/info`,
      {
        timeout: QB_TIMEOUT,
        params: { filter: 'all', sort: 'dlspeed', reverse: true },
        headers: { Cookie: `SID=${sid}` }
      }
    );
    // Only return essential fields to keep the payload small if needed, otherwise return all
    return response.data.map(torrent => ({
      name: torrent.name,
      hash: torrent.hash,
      progress: torrent.progress,
      dlspeed: torrent.dlspeed,
      upspeed: torrent.upspeed,
      state: torrent.state,
    }));
  } catch (error) {
    console.error(`Failed to fetch qBittorrent torrents from ${baseUrl}:`, axios.isAxiosError(error) ? error.message : String(error));
    return null;
  }
}

/**
 * Gathers comprehensive qBittorrent status.
 * @param baseUrl Base URL of the qBittorrent Web UI
 */
export async function getQBittorrentStatus(baseUrl: string): Promise<QBittorrentStatus> {
  // First, attempt to log in
  const sid = await login(baseUrl, QB_USERNAME, QB_PASSWORD);

  if (!sid) {
    return {
      globalTransferInfo: { dl_info_speed: 0, up_info_speed: 0, dl_info_data: 0, up_info_data: 0 },
      torrents: [],
      error: "qBittorrent 认证失败或无法连接",
    };
  }

  // If login is successful, proceed to fetch data
  const [globalInfo, torrents] = await Promise.all([
    getGlobalTransferInfo(baseUrl, sid),
    getTorrents(baseUrl, sid),
  ]);

  if (!globalInfo && !torrents) {
    return {
      globalTransferInfo: { dl_info_speed: 0, up_info_speed: 0, dl_info_data: 0, up_info_data: 0 },
      torrents: [],
      error: "无法获取 qBittorrent 状态 (登录成功但数据获取失败)",
    };
  }

  return {
    globalTransferInfo: globalInfo || { dl_info_speed: 0, up_info_speed: 0, dl_info_data: 0, up_info_data: 0 },
    torrents: torrents || [],
    error: globalInfo || torrents ? undefined : "部分 qBittorrent 状态获取失败",
  };
}
