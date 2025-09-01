import { WebSocketServer } from "ws";
import { setupChatHandler } from "./chat.js";

export function initializeWebSocketServer() {
  const wss = new WebSocketServer({ noServer: true }); //handling upgrade manually
  console.log("hanling socket init");
  //console.log('initialzing connection on', req, socket, head, route);

  wss.on("connection", (ws, req, route) => {
    console.log("socket connection found on: ", req.socket.remotePort);
    ws.port = req.socket.remotePort
    ws.route = route;
    ws.isAlive = true;

    switch (route) {
      case "/chat":
        setupChatHandler(ws, wss);
        break;
      default:
        socket.write(`${req.protocol} 404 NOT FOUND FOR ROUTE ${route}`);
        break;
    }

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      console.log(ws.username, " has disconnected");
    });

    ws.on("error", (error) => {
      console.error(`[${route.toUpperCase()}] WebSocket error:`, error);
    });
  });

  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        console.log(
          `ping send pong failed, closing socket ${ws?.username ?? req.socket.remotePort}`
        );

        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(heartbeat);
  });

  function handleUpgrade(req, socket, head, route) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req, route);
    });
  }

  return {
    wss,
    handleUpgrade,
  };
}
