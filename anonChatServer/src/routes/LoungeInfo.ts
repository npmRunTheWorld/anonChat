import express from "express";
import { roomMap } from "./../sockets/chat.ts";
import { userMap } from "./../sockets/chat.ts";
import fs from 'fs';


import { successResponse } from "../utils/fx/responseObject.ts";

//ROUTE LOUNGEINFO
const loungeRouter = express.Router();

function getPublicRooms() {
  return Object.fromEntries(
    [...roomMap]
      .filter(([roomId, value]) => {
        const { isPublic } = value;
        return isPublic;
      })
      .map(([roomId, value]) => {
        const { users, ...rest } = value;
        return [
          roomId,
          {
            ...rest,
            anonUsersCount: users.length,
          },
        ];
      })
  );
}

function getAllRooms() {
  return Object.fromEntries(
    [...roomMap].map(([roomId, value]) => {
      const { users, ...rest } = value;
      return [
        roomId,
        {
          ...rest,
          anonUsersCount: users.length,
        },
      ];
    })
  );
}

loungeRouter.route("/getRooms").get(async (req, res) => {
  //console.log('returning data' , rooms);
  const rooms = getPublicRooms();
  successResponse({
    res,
    data: rooms,
  });
});

loungeRouter.route("/getSiteDetails").get(async (req, res) => {
  const rooms = getAllRooms();
  
  
  successResponse({
    res,
    data: {
      totalActiveRooms: rooms.length,    
    }
  })
  
});

export default loungeRouter;
