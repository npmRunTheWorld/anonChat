import { initStatsInMemCache } from "../docs/docs/statsDocTransactions.ts";

export async function initDb(){
   //start stats in memory cache
   await initStatsInMemCache();
}