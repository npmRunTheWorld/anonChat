import {
  statsCache,
  StatsType,
  updateStatsDoc,
} from "@/db/methods/documentBuilders/statsDocTransactions.ts";
import WebSocket, { WebSocketServer } from "ws";
import type { RawData } from "ws";

type UserType = {
  connection: CustomWebSocket;
  data: string;
  usernameAndId: string;
  username: string;
  roomId: string;
  port: string;
  userColor: string;
};

export type UserMapType = Map<string, UserType>;

export type RoomType = {
  users: string[];
  roomTitle?: string;
  roomTopics?: string[] | string;
  isPublic: boolean;
  hostId: string;
  hostUsername: string;
  totalUsers: number;
  totalMessages: number;
  [keyof: string]: any;
};
export type RoomMapType = Map<string, RoomType>;

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

export type ServerMessageType = {
  emitType: "roomData" | "message" | string;
  messageType?: "chat" | "systemMessage" | "serverFailure" | string;
  username: "system" | string;
  data: string | Record<string, any>;
  [key: string]: any;
};

export const userMap: UserMapType = new Map();
export const roomMap: RoomMapType = new Map<string, RoomType>();

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

function broadcastAll(data: string, wss: WebSocketServer) {
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
  const room = roomMap.get(roomId) as RoomType | undefined;
  const usersInRoom = room?.users ?? [];

  if (!room) return;

  if (msg.emitType === "message" && msg.messageType === "chat") {
    roomMap.set(roomId, {
      ...room,
      totalMessages: room?.totalMessages + 1,
    });
  }
  usersInRoom.forEach((user: string) => {
    const userObj = userMap.get(user);
    if (!userObj) return;
    const userSocket = userObj.connection;
    userSocket.send(JSON.stringify(msg));
  });
}

function broadCastToRoomAndExcludeFollowingUsers(
  msg: ServerMessageType,
  ws: CustomWebSocket,
  users: string[]
) {
  //console.log("broadcasting to room :", ws.roomId);

  const roomId = ws.roomId;
  const usersInRoom = roomMap.get(roomId)?.users ?? [];

  usersInRoom
    .filter((user) => !users.includes(user))
    .forEach((user: string) => {
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
      emitType: "roomData",
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
      emitType: "message",
      messageType: "systemFailure",
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
      totalUsers: 1,
      totalMessages: 0,
    });

    updateStatsDoc({
      activeRooms: statsCache?.activeRooms + 1,
      shadowsOnline: statsCache.shadowsOnline + 1,
    } as StatsType);
  } else {
    //other users (PARTICIPANTS)
    const prevRoomData = roomMap.get(ws.roomId);
    if (!prevRoomData) return;

    const updatedRoomData = {
      ...prevRoomData,
      users: [...prevUsers, ws.usernameAndId],
      totalUsers: prevRoomData.totalUsers + 1,
    };
    roomMap.set(ws.roomId, updatedRoomData);

    scheduleDbBatchUpdate({
      shadowsOnline: statsCache.shadowsOnline + 1,
    } as StatsType);
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

  logRoomData(ws);

  const userActivity: ServerMessageType = {
    emitType: "message",
    messageType: "systemMessage",
    username: "system",
    data: `${ws.username} has entered the room!`,
    isSystemMsg: true,
    time: new Date().toLocaleDateString(),
  };
  broadCastToRoomAndExcludeFollowingUsers(userActivity, ws, [
    `${ws.usernameAndId}`,
  ]);
}

let batchUpdateTimeout: NodeJS.Timeout | null = null;
function scheduleDbBatchUpdate(data: StatsType) {
  if (batchUpdateTimeout) clearTimeout(batchUpdateTimeout);

  batchUpdateTimeout = setTimeout(() => {
    console.log("batch update of room data started");
    updateStatsDoc({ ...data });
  }, 30000);
}

function logRoomData(ws: CustomWebSocket) {
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

function handleLastUserDisconnect(
  users: RoomType["users"],
  ws: CustomWebSocket,
  room: RoomType
) {
  console.log("Room Closed updating db", users, room);
  if (!users || users.length === 1) {
    // deletes the room completely when last user leaves
    if (!room) return;

    updateStatsDoc({
      activeRooms: statsCache?.activeRooms - 1,
      shadowsOnline: statsCache?.shadowsOnline - 1,
      totalUsers: statsCache.totalUsers + room?.totalUsers,
      secretsShared: statsCache.secretsShared + room?.totalMessages,
    });

    roomMap.delete(ws.roomId);
    userMap.delete(ws.usernameAndId);
    return;
  }
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
        emitType: "message",
        messageType: "chat",
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
    const prevRoomData = roomMap.get(ws.roomId) as RoomType;
    let users = prevRoomData?.users ?? [];
    handleLastUserDisconnect(users, ws, prevRoomData);

    if (!prevRoomData) {
      userMap.delete(ws.usernameAndId);
      return;
    }

    // remove the user from the room
    const updatedUsers = users.filter((user) => user !== ws.usernameAndId);

    let newHostId = prevRoomData.hostId;
    let newHostUsername = prevRoomData.hostUsername;

    if (ws.usernameAndId === prevRoomData.hostId || !prevRoomData.hostId) {
      // current host left → assign new host
      if (updatedUsers.length > 0) {
        const firstUserId = updatedUsers[0];
        const firstUserObj = userMap.get(firstUserId);
        if (firstUserObj) {
          newHostId = firstUserObj.usernameAndId;
          newHostUsername = firstUserObj.username;
        } else {
          // fallback: no user object found, clear host
          newHostId = "";
          newHostUsername = "";
        }
      } else {
        newHostId = "";
        newHostUsername = "";
      }
    }

    // update room
    roomMap.set(ws.roomId, {
      ...prevRoomData,
      users: updatedUsers,
      hostId: newHostId,
      hostUsername: newHostUsername,
    });

    // remove user
    userMap.delete(ws.usernameAndId);
    // notify room
    if (updatedUsers.length > 0) {
      const anyRemainingUser: UserType | undefined = userMap.get(
        updatedUsers[0]
      );
      if (anyRemainingUser) {
        logRoomData(ws);
        broadcastRoomData(anyRemainingUser?.connection);

        broadCastToRoom(
          {
            emitType: "message",
            messageType: "systemMessage",
            username: "system",
            data: `${ws.username} has left the room.`,
            textColor: "#8F0E28",
          },
          anyRemainingUser?.connection
        );
      }
    }
  });
}
