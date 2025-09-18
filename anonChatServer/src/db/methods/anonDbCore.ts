import fs, { PathLike } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import lockfile, { lock } from "proper-lockfile";
import writeFileAtomic from "write-file-atomic";
import { initialStatsDoc } from "./documentBuilders/statsDocTransactions.ts";

//@TYPES
export type DocsType = {
  createdAt: null | Date;
  updatedAt: null | Date;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//collections
const collections = join(__dirname, "../collections");
const mainCollection = `${collections}/main`;

//mainCollection -> documents
export const docStatPath = `${mainCollection}/stats.json`;

//logs
const logger = "logs.json";

function createDocIfNotExistINIT(docPath: PathLike) {
  const dir = dirname(`${docPath}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(docPath)) {
    fs.writeFileSync(docPath, JSON.stringify(initialStatsDoc));
  }
}

export function createDocIfNotExist(docPath: PathLike) {
  const dir = dirname(`${docPath}`);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readDoc(docPath: PathLike) {
  const data = fs.readFileSync(docPath, "utf8");
  return JSON.parse(data);
}

export function initializeDatabaseJSON() {
  console.log("stats.json path -> ", docStatPath);
  createDocIfNotExistINIT(docStatPath);

  const statsDocData = readDoc(docStatPath);
  if (statsDocData.length == 0) {
    fs.writeFileSync(
      docStatPath,
      JSON.stringify(initialStatsDoc, null, 2),
      "utf-8"
    );
  }
}
/* 
function formatDate(d = new Date()) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0") +
    " " +
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0") +
    ":" +
    String(d.getSeconds()).padStart(2, "0")
  );
}
 */

export async function safeWriteDoc(docPath: PathLike, data: any) {
  //lock file
  const release = await lockfile.lock(`${docPath}`);

  console.log("writing safely to --> ", docPath, data);

  try {
    await writeFileAtomic(`${docPath}`, JSON.stringify(data));
  } catch (error) {
    console.log("unexpected error during writing file atomically");
  } finally {
    await release();
  }
}
