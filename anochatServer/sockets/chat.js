const userMap = new Map();
const roomMap = new Map();

function broadcastAll(data, wss) {
  wss.clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      const msg = JSON.stringify(data);
      ws.send(msg);
    }
  });
}

function broadCastToRoom(msg, ws) {
  //console.log("broadcasting to room :", ws.roomId);

  const roomId = ws.roomId;
  const usersInRoom = roomMap.get(roomId);

  usersInRoom.forEach((user) => {
    const userSocket = userMap.get(user).connection;
    userSocket.send(JSON.stringify(msg));
  });
}

function closeConnection(ws, msg, errorName, errorResolver) {
  ws.send(
    JSON.stringify({
      username: "system",
      txt: msg,
      time: new Date().toLocaleTimeString(),
      error: {
        code: errorName ?? "error",
        resolver: errorResolver ?? null,
      },
    })
  );
  ws.close();
  return;
}

function addUser(ws, msg) {
  //ws consistent data access username, roomId
  ws.username = msg.username;
  ws.roomId = msg.data.roomId;

  console.log(`user ${ws.username} has connected!`);

  let prevUsers = roomMap.get(ws.roomId);

  if (!prevUsers || !Array.isArray(prevUsers)) {
    prevUsers = [];
  }

  roomMap.set(ws.roomId, [...prevUsers, ws.username]); //room map --> has all users by username
  userMap.set(ws.username, {
    connection: ws,
    data: msg.data,
  });
}

const bgColors = [
  "#ef444426", // red-500
  "#f9731626", // orange-500
  "#f59e0b26", // amber-500
  "#eab30826", // yellow-500
  "#84cc1626", // lime-500
  "#22c55e26", // green-500
  "#10b98126", // emerald-500
  "#14b8a626", // teal-500
  "#06b6d426", // cyan-500
  "#0ea5e926", // sky-500
  "#3b82f626", // blue-500
  "#6366f126", // indigo-500
  "#8b5cf626", // violet-500
  "#a855f726", // purple-500
  "#d946ef26", // fuchsia-500
  "#ec489926", // pink-500
  "#f43f5e26", // rose-500
  "#9ca3af26", // gray-400
  "#6b728026", // gray-500
  "#37415126", // gray-700
];

export function setupChatHandler(ws, wss) {
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
        closeConnection(
          ws,
          "ERROR: no username detected closing connection",
          "noUser"
        );
        return;
      }

      //check user exists
      if (userMap.get(msg.username)) {
        closeConnection(
          ws,
          "ERROR: duplicate username in this room, please provide an unique username",
          "duplicateUser",
          roomMap.get(ws.roomId)
        );
        return;
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

      const sentMsgObj = {
        username: ws.username,
        time: time,
        txt: msg,
        bgColor: bgColors[ws.port % bgColors.length],
      };

      broadCastToRoom(sentMsgObj, ws);
    }
  });

  ws.on("close", () => {
    let users = roomMap.get(ws.roomId) ?? [];

    roomMap.set(
      ws.roomId,
      users.filter((user) => user !== ws.username)
    );

    userMap.delete(ws.username);
  });
}
