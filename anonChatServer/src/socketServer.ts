import express from "express";
import { initializeWebSocketServer } from "./sockets/index.ts";
import loungeRouter from "./routes/loungeRoute.ts";
import cors from "cors";
import * as dotenv from "dotenv";
import { initDb } from "./db/scripts/initDb.ts";
import { randomUUID } from "crypto";
import { TLSSocket } from "tls";

dotenv.config();
const port = process.env.PORT || 8000;
const allowedOrigins = process.env?.ALLOWED_ORIGINS?.split(",")?.map((url) => {
  return url.trim().toLowerCase();
}) ?? [""];

console.log('allowed origins: ', allowedOrigins);

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
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

//#MIDDLEWARE
app.use((req, res, next) => {
  const requestId = randomUUID();
  console.log("req is entering", requestId);

  res.setHeader("X-REQUEST-ID", requestId);
  // optional: log each request
  console.log(
    `REQ-ID:[${requestId}] <${new Date().toLocaleTimeString()}> : ${
      req.method
    } ${req.originalUrl}`
  );

  next();
});

//#ROUTES
const v1 = "/api/v1";
app.get(`${v1}`, (req, res) => {
  res.send("Welcome to anonChat API V1");
});

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
  const tlsSocket = req.socket as TLSSocket
  
  const protocol = tlsSocket.encrypted ? "https" : "http";
  const { pathname } = new URL(req.url!, `${protocol}://${req.headers.host}`);
  console.log("socket upgrade protocol:", protocol , "path: ", pathname);
  switch (pathname) {
    case "/api/chat":
      handleUpgrade(req, socket, head, "/api/chat");
      break;
    case "/api/notification":
      handleUpgrade(req, socket, head, "/api/notification");
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
