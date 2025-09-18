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
  statsCache = await readDoc(docStatPath);
  if (!statsCache) statsCache = initialStatsDoc;
}

export async function getStats() {
  return statsCache;
}

export async function updateStatsDoc(updates: Partial<StatsType>) {
  if (!statsCache) await initStatsInMemCache();

  Object.assign(updates, {
    updatedAt: new Date().toISOString(),
  });

  statsCache = {
    ...statsCache,
    ...updates,
  };

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
