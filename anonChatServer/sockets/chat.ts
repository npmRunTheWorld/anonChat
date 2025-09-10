import WebSocket, { WebSocketServer } from "ws";
import type { RawData } from "ws";

export type UserMapType = Map<
  string,
  {
    connection: WebSocket;
    data: string;
    usernameAndId: string;
    username: string;
    roomId: string;
    port: string;
    userColor: string;
  }
>;

export type RoomMapType = Map<
  string,
  {
    users: string[];
    roomTitle?: string;
    roomTopics?: string[] | string;
    isPublic: boolean;
    hostId: string;
    hostUsername: string;
  }
>;

export type CustomWebSocket = WebSocket & {
  usernameAndId: string;
  username: string;
  port: string;
  roomId: string;
};

export type ClientMessageType =
  | string
  | {
      type: string;
      [key: string]: any;
    };

export type ServerMessageType =
  | string
  | {
      serverType: string;
      [key: string]: any;
    };

const userMap: UserMapType = new Map();
const roomMap: RoomMapType = new Map();
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

function broadcastAll(data, wss) {
  wss.clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      const msg = JSON.stringify(data);
      ws.send(msg);
    }
  });
}

/* ANY MESSAGE TO ALL */
function broadCastToRoom(msg: ServerMessageType, ws: CustomWebSocket) {
  //console.log("broadcasting to room :", ws.roomId);

  const roomId = ws.roomId;
  const usersInRoom = roomMap.get(roomId)?.users;

  usersInRoom!.forEach((user: string) => {
    const userObj = userMap.get(user);
    if (!userObj) return;
    const userSocket = userObj.connection;
    userSocket.send(JSON.stringify(msg));
  });
}

/* ROOM DATA ONLY TO ALL*/
function broadcastRoomData(ws: CustomWebSocket) {
  if (!ws.roomId) {
    closeConnection(ws, "Cannot get room data, user is missing room Id");
    return;
  }
  const room = roomMap.get(ws.roomId);
  const users = room?.users;

  if (!users || !room) return;

  const userInfoAgg = users.map((user) => {
    const userObj = userMap.get(user);

    if (!userObj) {
      console.log("ERROR: BroadCasting Failure, user is missing from record");
      return;
    }

    return {
      usernameAndId: userObj.usernameAndId,
      username: userObj.username,
      port: userObj.port,
      userColor: userObj.userColor,
    };
  });

  broadCastToRoom(
    {
      serverType: "roomData",
      username: "system",
      data: {
        users: userInfoAgg,
        currUsername: ws.username,
        currUsernameAndId: ws.usernameAndId,
        hostId: room.hostId,
        title: room.roomTitle,
        isPublic: room.isPublic,
        topics: room.roomTopics,
      },
      time: new Date().toLocaleDateString(),
    },
    ws
  );
}

function closeConnection(
  ws: CustomWebSocket,
  msg: string,
  errorName?: string,
  errorResolver?: {
    [key: string]: any;
  }
) {
  ws.send(
    JSON.stringify({
      serverType: "message",
      username: "system",
      data: msg,
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

function addUser(ws: CustomWebSocket, msg: ClientMessageType) {
  if (typeof msg === "string") return;

  //ws consistent data access username, roomId
  ws.usernameAndId = msg.username + "#" + ws.port;
  ws.username = msg.username;
  ws.roomId = msg.data.roomId;

  if (!ws.username || !ws.roomId) {
    closeConnection(
      ws,
      "No username provided for this user or room id",
      "addUserFailure1"
    );
  }

  console.log(`user ${ws.usernameAndId} has connected!`);

  let prevUsers = roomMap.get(ws.roomId)?.users;

  if (!prevUsers || !Array.isArray(prevUsers)) {
    prevUsers = [];
  }

  if (!prevUsers.length) {
    //first user (HOST)
    roomMap.set(ws.roomId, {
      users: [...prevUsers, ws.usernameAndId],
      roomTitle: msg.data.title,
      isPublic: msg.data.isPublic,
      roomTopics: msg.data.topics,
      hostId: ws.usernameAndId,
      hostUsername: ws.username,
    });
  } else {
    //other users (PARTICIPANTS)
    const prevRoomData = roomMap.get(ws.roomId);
    if (!prevRoomData) return;

    roomMap.set(ws.roomId, {
      ...prevRoomData,
      users: [...prevUsers, ws.usernameAndId],
    });
  }

  //room map --> has all users by username
  userMap.set(ws.usernameAndId, {
    connection: ws,
    data: msg.data,
    usernameAndId: ws.usernameAndId,
    username: ws.username,
    roomId: msg.data.roomId,
    port: ws.port,
    userColor: bgColors[Number(ws.port) % bgColors.length],
  });

  console.log("users in room: ", ws.roomId, "---->", roomMap.get(ws.roomId));
}

function userRecord(ws: CustomWebSocket, msg: ClientMessageType) {
  if (typeof msg === "string") return;

  if (!msg.username) {
    closeConnection(
      ws,
      "ERROR: no username detected closing connection",
      "noUser"
    );
    return;
  }

  let modifiedUsersObj = {};
  const users = roomMap.get(msg.data.roomId);

  if (users && Array.isArray(users)) {
    users.forEach((user) => (modifiedUsersObj[user] = true));
    console.log("users updated:", modifiedUsersObj);
  }

  //check user exists
  if (userMap.get(msg.username)) {
    closeConnection(
      ws,
      "ERROR: duplicate username in this room, please provide an unique username",
      "duplicateUser",
      modifiedUsersObj
    );
    return;
  }
  //success, initialization is valid add user into connection
  addUser(ws, msg);

  //broadcast room information to all users in room
  broadcastRoomData(ws);
}

export function setupChatHandler(ws: CustomWebSocket, wss: WebSocketServer) {
  ws.on("message", (message: RawData) => {
    let msg: ClientMessageType = "";
    try {
      msg = JSON.parse(message.toString());
    } catch (error) {
      msg = message.toString();
    }

    //initialize user
    //add user connection to ws
    if (typeof msg === "object" && msg.type == "userRecord") {
      userRecord(ws, msg);
    }

    //check if username exists for this connection before proceeding with any other action
    if (!ws.username) {
      closeConnection(ws, "ERROR: no username detected closing connection");
      return;
    }

    //success, valid user! can perform all following actions below this point
    if (typeof msg === "string") {
      const time = new Date().toLocaleTimeString();
      const user = userMap.get(ws.usernameAndId);

      if (!user) {
        closeConnection(
          ws,
          "Critical error trying to send message to an undefined user"
        );
        return;
      }

      const sentMsgObj: ServerMessageType = {
        serverType: "message",
        usernameAndId: user.usernameAndId,
        username: user.username,
        port: user.port,
        time: time,
        data: msg,
        userColor: user.userColor,
      };
      //console.log(`[${sentMsgObj.username}#${sentMsgObj.port}] : ${msg}`);

      broadCastToRoom(sentMsgObj, ws);
    }
  });

  ws.on("close", () => {
    let users = roomMap.get(ws.roomId)?.users ?? [];
      
    if (!users || users.length === 0) {
      //deletes the room completely to ensure full privacy when the final user leaves (no lingering rooms)
      roomMap.delete(ws.roomId);
      return;
    }
    
    const prevRoomData = roomMap.get(ws.roomId);
    if (!prevRoomData) return;

    if (ws.usernameAndId === prevRoomData.hostId || !prevRoomData.hostId) {
      //the user that disconnected was a host (update new host)
      let recentTopUser = roomMap.get(ws.roomId)?.users;
      prevRoomData.hostId === recentTopUser?.[0];
    }

    roomMap.set(ws.roomId, {
      ...prevRoomData,
      users: users?.filter((user) => user !== ws.usernameAndId),
    });
    
    userMap.delete(ws.usernameAndId);
    broadcastRoomData(ws);
  });
}
