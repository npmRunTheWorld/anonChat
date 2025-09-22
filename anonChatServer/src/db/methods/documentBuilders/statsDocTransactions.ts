import { FLUSH_INTERVAL } from "@/utils/constants/system.ts";
import {
  createDocIfNotExist,
  docStatPath,
  readDoc,
  safeWriteDoc,
} from "../anonDbCore.ts";

export type StatsType = {
  activeRooms: number;
  shadowsOnline: number;
  totalUsers: number;
  secretsShared: number;
  updatedAt: string;
  createdAt: string;
};

export const initialStatsDoc: StatsType = {
  activeRooms: 0,
  shadowsOnline: 0,
  totalUsers: 0,
  secretsShared: 0,
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

//cached data
export let statsCache: StatsType;

let flushTimeout: NodeJS.Timeout | null = null;

export async function initStatsInMemCache() {
  //this is the first document read <in future before restoring the system we need to flush the WAL RECORDS>
  statsCache = await readDoc(docStatPath);
  if (!statsCache) statsCache = initialStatsDoc;

  if (statsCache.activeRooms !== 0) {
    const DIRECT_WRITE = true;
    updateStatsDoc(
      {
        activeRooms: 0,
      },
      DIRECT_WRITE
    );
    statsCache.activeRooms = 0;
  }
}

export async function getStatsDoc() {
  return await readDoc(docStatPath);
}

export async function updateStatsDoc(
  updates: Partial<StatsType>,
  isDirectWrite?: boolean
) {
  if (!statsCache) await initStatsInMemCache();

  Object.assign(updates, {
    updatedAt: new Date().toISOString(),
  });

  statsCache = {
    ...statsCache,
    ...updates,
  };

  if (isDirectWrite) {
    flushToDisk();
    return;
  }

  scheduleFlush();
}

function scheduleFlush() {
  //debounce
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(() => {
    flushToDisk();
  }, FLUSH_INTERVAL);
}

async function flushToDisk() {
  if (!statsCache) return;
  createDocIfNotExist(docStatPath);
  await safeWriteDoc(docStatPath, statsCache);
}
