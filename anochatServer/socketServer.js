import express from "express";
import { WebSocketServer } from "ws";


/* dotenv.config();*/

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || "localhost:";

const server = app.listen(port, () => {
  console.log("PriChat listening on port: ", port);
});

const userMap = new Map();

const wss = new WebSocketServer({ "server": server });

function broadcast(data) {
  wss.clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      const msg = JSON.stringify(data);
      ws.send(msg);
    }
  });
}

function closeConnection(ws, msg) {
  ws.send(JSON.stringify(msg));
  ws.close();
  return;
}

function addUser(ws, msg) {
  ws.username = msg.username;
  userMap.set(msg.username, {
    connection: ws,
    data: msg.data,
    port,
  });
}
wss.on("connection", (ws, req) => {
  const port = req.socket.remotePort;

  ws.on("message", (message) => {
    let msg = "";
    try {
      msg = JSON.parse(message.toString());
    } catch (error) {
      msg = message.toString();
    }

    const isMsgObj = typeof msg === "object";
    const isMsgStr = typeof msg === "string";

    //record user connection to ws
    if (isMsgObj && msg.type == "userRecord") {
      if (!msg.username) {
        closeConnection(ws, "ERROR: no username detected closing connection");
        return;
      }
      
      //check user exists
      if (userMap.get(msg.username)) {
        closeConnection(
          ws,
          "ERROR: duplicate username, please provide an unique username"
        );
      }
      //success, initialization is valid add user into connection
      addUser(ws, msg);
    }

    //check if username exists for this connection before proceeding with any other action
    if (!ws.username) {
      closeConnection(ws, "ERROR: no username detected closing connection");
      return;
    }

    //success, valid user! can perform all following actions below this point
    if (isMsgStr) {
      const time = new Date().toLocaleTimeString();
      broadcast(`${ws.username} [${time}]: ${msg}`);
    }
  });

  ws.on("close", () => {
    console.log(ws.username, " has disconnected");
    userMap.delete(ws.username);
  });
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
