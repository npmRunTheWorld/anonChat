import express from "express";
import { WebSocketServer } from "ws";
import * as dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the ANON CHAT API");
});

//initializations
const server = app.listen(PORT, () => {
  console.log("LISTENING ON PORT: ", PORT);
});

const wsServer = new WebSocketServer({ noServer : true });   //no server to handle upgrade manually 

server.on("upgrade", (req, socket, head) => {
  const { pathname } = parse(req.url);
  
  console.log(`WebSocket upgrade request for: ${pathname}`);

  if (pathname === "/chat") {
    wsServer.handleUpgrade(req, socket, head, (ws) => {
      wsServer.emit("connection", ws, request, "chat");
    });
  } else {
    socket.write('HTTP/1.1 404 NOT FOUND\r\n\r\n')
    socket.destroy();
  }
});

//getting websocket
let usersData = new Map();

wsServer.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  const port = req.socket.remotePort;
  const host = req.headers.host;
  const origin = req.headers.origin;

  console.log(
    `New client from ip: ${ip} port:${port}, host: ${host}, origin: ${origin}`
  );

  //console.log(`WS: ${JSON.stringify(ws)}`);

  ws.send("Welcome to websocket server");

  //messages
  ws.on("message", (msg) => {
    let message = "";

    try {
      message = JSON.parse(msg.toString());
    } catch (error) {
      //parse failed must be plain text
      message = msg.toString();
    }
    //console.log("message: ", msg, typeof msg, JSON.stringify(message));

    if (typeof message == "object" && message.type === "userInfo") {
      usersData.set(ws, message.data);
    }

    if (typeof message === "string" || message.type === "message") {
      const username = usersData.get(ws).username;
      const userMsg = `${username}: ${message}`;
      broadcast(userMsg);
    }
  });

  ws.on("close", () => {
    console.log(`Client ${port} Client Disconnected`);
    usersData.delete(ws);
  });
});

//web socket broadcast
function broadcast(data) {
  wsServer.clients.forEach((socket) => {
    if (socket.readyState === socket.OPEN) {
      const msg = `${data}`;
      socket.send(JSON.stringify(msg));
    }
  });
}

//CLIENT SIDE CODE FOR TEST

/*
const ws = new WebSocket('ws://localhost:8000');
ws.onopen = (data) => {
  ws.send(JSON.stringify({
    type: 'userInfo',
    data: {
      username: '',
      age: ''
    }
  }))
}
ws.onmessage = (event) => {
  console.log(event.data);
};
*/
