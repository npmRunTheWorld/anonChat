import express from "express";
import { roomMap } from "../sockets/chat.ts";

import { successResponse } from "../utils/fx/responseObject.ts";
import { getStatsDoc } from "@/db/methods/documentBuilders/statsDocTransactions.ts";

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

try {
  loungeRouter.route("/getRooms").get(async (req, res) => {
    //console.log('returning data' , rooms);
    const rooms = getPublicRooms();
    successResponse({
      res,
      data: rooms,
    });
  });

  loungeRouter.route("/getSiteDetails").get(async (req, res) => {
    const stats = await getStatsDoc();
    console.log("gettingSiteDetails ::: ", stats);
    successResponse({
      res,
      data: stats,
    });
  });
} catch (error) {
  console.log("unexpected error at ROUTE: LOUNGEINFO -> ", error);
}

export default loungeRouter;
