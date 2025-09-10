import express from "express";
import { initializeWebSocketServer } from './sockets/index.js';

/* dotenv.config();*/

const app = express();
app.use(express.json());

const environment = process.env.ENVIRONMENT || "development";
const port = process.env.PORT || 8000;
const domain = process.env.DOMAIN || `localhost:${port}`;

const server = app.listen(port, () => {
  console.log("ANON CHAT listening on port: ", port);
});


const { handleUpgrade } = initializeWebSocketServer();

server.on("upgrade", (req, socket, head) => {
  const protocol = req.socket.encrypted ? "https" : "http";
  const { pathname } = new URL(req.url, `${protocol}://${req.headers.host}`);
  console.log('socket upgrade, path: ', pathname);
  switch (pathname) {
    case "/chat":
      handleUpgrade(req, socket, head, '/chat');
      break;
    case "/notification":
      handleUpgrade(req, socket, head, '/notification');
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
