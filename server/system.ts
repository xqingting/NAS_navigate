import si from "systeminformation";
import { SystemStatus } from "./types";

export async function getSystemStatus(): Promise<SystemStatus> {
  try {
    const [cpuLoad, mem, fsSize, cpuTemp] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.cpuTemperature(),
    ]);

    // Filter filesystems: exclude loops, snaps, and small temporary filesystems if desired
    // For now, we exclude loop devices (often used by snaps on Linux)
    const filteredFs = fsSize
      .filter((fs) => !fs.fs.startsWith("/dev/loop") && fs.size > 0)
      .map((fs) => ({
        fs: fs.fs,
        mount: fs.mount,
        type: fs.type,
        size: fs.size,
        used: fs.used,
        use: fs.use,
      }));

    return {
      cpu: {
        currentLoad: cpuLoad.currentLoad,
        temperature: cpuTemp.main,
      },
      mem: {
        total: mem.total,
        used: mem.used,
        active: mem.active,
        available: mem.available,
      },
      fs: filteredFs,
    };
  } catch (error) {
    console.error("Error fetching system status:", error);
    return {
      cpu: { currentLoad: 0 },
      mem: { total: 0, used: 0, active: 0, available: 0 },
      fs: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
