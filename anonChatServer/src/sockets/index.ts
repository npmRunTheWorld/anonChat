import { WebSocketServer } from "ws";
import { CustomWebSocket, setupChatHandler } from "./chat.ts";
import { Request } from "express";
import { TLSSocket } from "tls";
import { IncomingMessage } from "http";
import { Duplex } from "stream";

export function initializeWebSocketServer() {
  const wss = new WebSocketServer({ noServer: true }); //handling upgrade manually
  console.log("hanling socket init");
  //console.log('initialzing connection on', req, socket, head, route);

  wss.on("connection", (ws: CustomWebSocket, req: Request, route: string) => {
    console.log("socket connection found on: ", req.socket.remotePort);
    ws.port = `${req.socket.remotePort}`;
    ws.route = route;
    ws.isAlive = true;

    switch (route) {
      case "/api/chat":
        setupChatHandler(ws, wss);
        break;
      default:
        ws.send(`${req.protocol} 404 NOT FOUND FOR ROUTE ${route}`);
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
    wss.clients.forEach((ws: any) => {
      if (!ws.isAlive) {
        console.log(`ping send pong failed, closing socket ${ws?.username}`);

        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(heartbeat);
  });

  function handleUpgrade(
    req: IncomingMessage,
    socket: Duplex,
    head: Buffer,
    route: string
  ) {
    const allowedRoutes = ["/api/chat"];
    if (!allowedRoutes.includes(route)) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      console.log('emitting connection');
      wss.emit("connection", ws, req, route);
    });
  }

  return {
    wss,
    handleUpgrade,
  };
}
