import fs from "fs/promises";
import path from "path";

// Define allowed log files and their internal paths
const ALLOWED_LOG_FILES: Record<string, string> = {
  "rclone-quark-sync": "/app/logs/rclone/quark-sync-folder.log",
};

const MAX_LOG_LINES = 100; // Max lines to read
const MAX_LOG_SIZE_BYTES = 1024 * 100; // Max 100KB to read

export async function getLogContent(logId: string): Promise<string> {
  const filePath = ALLOWED_LOG_FILES[logId];
  if (!filePath) {
    throw new Error("Invalid log ID provided.");
  }

  try {
    // Read the file content
    const stats = await fs.stat(filePath);

    // If file is too large, read only the end
    if (stats.size > MAX_LOG_SIZE_BYTES) {
      const content = await fs.readFile(filePath, { encoding: "utf8" });
      const lines = content.split("\n");
      const truncatedLines = lines.slice(-MAX_LOG_LINES);
      return `(显示最后 ${truncatedLines.length} 行，总大小 ${Math.round(stats.size / 1024)} KB)\n` + truncatedLines.join("\n");
    } else {
      return await fs.readFile(filePath, { encoding: "utf8" });
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Log file not found: ${logId}`);
    }
    throw new Error(`Failed to read log file '${logId}': ${error instanceof Error ? error.message : String(error)}`);
  }
}
