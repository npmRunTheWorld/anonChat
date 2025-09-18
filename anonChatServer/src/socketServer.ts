import express from "express";
import { initializeWebSocketServer } from "./sockets/index.ts";
import loungeRouter from "./routes/LoungeInfo.ts";
import cors from "cors";
import * as dotenv from "dotenv";
import { initStats } from "./db/docs/docs/statsDocTransactions.ts";
import { initDb } from "./db/scripts/initDb.ts";

dotenv.config();
const environment = process.env.ENVIRONMENT || "development";
const port = process.env.PORT || 8000;
const domain = process.env.DOMAIN || `localhost:${port}`;
const allowedOrigins = process.env?.ALLOWED_ORIGINS?.split(",")?.map((url) => {
  return url.trim().toLowerCase();
}) ?? [""];

console.log(allowedOrigins);

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (!allowedOrigins.includes(origin.toLowerCase())) {
        //error incorrect origin

        return callback(new Error(`Not allowed by CORS, origin: ${origin}`));
      }
      //success
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

//#ROUTES
const v1 = "/api/v1";
app.use(`${v1}/loungeInfo`, loungeRouter);

//ADDITIONAL SETTINGS
app.set("trust proxy", 1);

//APP INIT
async function appInit() {
  await initDb();
}
const server = app.listen(port, () => {
  appInit();
  console.log("ANON CHAT listening on port: ", port);
});

const { handleUpgrade } = initializeWebSocketServer();

server.on("upgrade", (req, socket, head) => {
  const protocol = req.socket.encrypted ? "https" : "http";
  const { pathname } = new URL(req.url, `${protocol}://${req.headers.host}`);
  console.log("socket upgrade, path: ", pathname);
  switch (pathname) {
    case "/chat":
      handleUpgrade(req, socket, head, "/chat");
      break;
    case "/notification":
      handleUpgrade(req, socket, head, "/notification");
      break;
    default:
      //unknown path
      socket.write(`${req.httpVersion} 404 Socket Not Found`);
      socket.destroy();
  }
});

//CLIENT SIDE CODE
/*
const ws = new WebSocket('ws://localhost:8000');
ws.onopen = (event) => {
  ws.send(JSON.stringify({
    type: 'userRecord',
    username: 'bob',
    data: {
      age: '30'
    }
  }))
}

ws.onmessage = (event) => {
  const msg = event.data;
  console.log(msg)
}

*/
