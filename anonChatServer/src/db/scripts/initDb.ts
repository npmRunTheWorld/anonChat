import { initStatsInMemCache } from "../methods/documentBuilders/statsDocTransactions.ts";

export async function initDb(){
   //start stats in memory cache
   await initStatsInMemCache();
}