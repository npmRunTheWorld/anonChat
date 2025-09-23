import { motion } from "framer-motion";
import {
  useMemo,
  type Dispatch,
  type Ref,
  type RefObject,
  type SetStateAction,
} from "react";
import {
  BiChevronDown,
  BiCopy,
  BiLock,
  BiLockOpen,
  BiMinus,
} from "react-icons/bi";
import { BsChevronBarLeft } from "react-icons/bs";
import { FaCrown } from "react-icons/fa";
import type { RoomData, SocketMsgObject } from "./ChatRoom";
import type { NotificationItem } from "@/components/ui/notifications/NotificationStack";
import { useNavigate } from "react-router-dom";
import { clearStorageUsername } from "@/utils/fx/sessionStorage";

type RoomDetailsProps = {
  ws: RefObject<WebSocket | null>;
  roomData: RoomData;
  username: string;
  isMobileAndShowRoomDetails: boolean;
  messages: SocketMsgObject[];
  id: any;
  setNotifications: Dispatch<SetStateAction<NotificationItem[] | []>>;
  setIsShowRoomDetails: Dispatch<SetStateAction<boolean>>;
};

const RoomDetails = ({
  ws,
  roomData,
  username,
  isMobileAndShowRoomDetails,
  messages,
  id,
  setNotifications,
  setIsShowRoomDetails,
}: RoomDetailsProps) => {
  const navigate = useNavigate();
  const prioSortedUsers = useMemo(() => {
    const currentUser = roomData?.users.find((user) => {
      console.log("FIND", user.username, username);
      return user.username === username;
    });
    const otherUsers = roomData?.users.filter(
      (user) => user.username !== username
    );
    console.log("RESULE", currentUser, otherUsers);
    return currentUser ? [currentUser, ...otherUsers] : roomData?.users;
  }, [username, roomData]);
  // States

  // Lifecycle

  // Functions
  function leaveRoom(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    ws?.current?.close();
    clearStorageUsername();
    navigate("/");
  }

  function toggleShowRoomDetails() {
    setIsShowRoomDetails((prev) => (prev = !prev));
  }
  return (
    <>
      <motion.section
        className={`w-full h-3/10 md:h-full md:w-1/5 flex flex-col bg-gray-900/40 border border-red-900/30 ${
          isMobileAndShowRoomDetails && "h-fit"
        }`}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          /* clipPath: "circle(40% at 50% 30%)" */
          /* clipPath: "ellipse(40% 50% at 50% 30%)" */
          /* clipPath: "path('M 10,40 L 70,40 L 70,60 L 70,300 Z')" */
          /* clipPath: "inset(10% 20% 30% 40% round 20px)" */
        }}
      >
        {/* Terminal Header */}
        <div
          className={`p-4 border-b border-red-900/30 order-2 md:order-1 ${
            !isMobileAndShowRoomDetails ? "block" : "hidden"
          }`}
        >
          <div className="space-y-2">
            <div className="text-xs md:text-md text-orange-400 gap-2 font-mono">
             ROOM:&nbsp;
              {roomData?.title?.length ? (
                <span className="text-white">{roomData?.title}</span>
              ) : (
                <span className="text-muted">###</span>
              )}
            </div>
            <div className="text-xs md:text-md text-gray-400 text-sm font-mono">
              ID:&nbsp;
              <span className="text-orange-300">{id}</span>
            </div>
            {roomData.topics && roomData.topics.length > 0 && (
              <div className="text-gray-400 text-sm font-mono">
                {/*  <span className="text-gray-500">&gt;</span> TOPICS: {roomData.topics.map(topic => `[${topic}]`).join(" ")} */}
              </div>
            )}
          </div>
        </div>

        {/* Users List*/}
        <div
          className={`flex-1 pl-4 pr-4 overflow-y-auto order-3 md:order-2 ${
            !isMobileAndShowRoomDetails ? "block" : "hidden"
          }`}
        >
          <div className="mb-4">
            <h3 className="text-red-400 font-bold text-sm uppercase font-mono">
              ACTIVE_USERS [{prioSortedUsers.length}]
            </h3>
            <div className="h-px bg-red-600 mt-1 mb-3"></div>
          </div>

          <div className="space-y-2">
            {prioSortedUsers.length === 0 ? (
              <p className="text-white/40 font-mono text-sm">
                No users connected
              </p>
            ) : (
              prioSortedUsers.map((user, userIndex) => (
                <motion.div
                  key={`room-user-tag-${user.usernameAndId}-${userIndex}`}
                  className="group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: userIndex * 0.1 }}
                >
                  <div className="flex items-center gap-3 p-2 hover:bg-red-900/10 transition-all">
                    <div
                      className="w-3 h-3 border border-white/30"
                      style={{ backgroundColor: user.userColor || "#666" }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {roomData.hostId === user.usernameAndId && (
                          <FaCrown className="text-yellow-400 text-xs" />
                        )}
                        <span className="text-white text-sm font-mono">
                          {user.username}
                        </span>
                        {user.username === username && (
                          <span className="text-green-400 text-xs font-mono">
                            [YOU]
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs font-mono">
                        #{user.port}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-row-reverse md:flex-col justify-between items-center p-1 gap-2 md:p-4 border-t border-red-900/30 md:space-y-2 order-1 md:order-3">
          <button
            onClick={() => {
              if (id) {
                navigator.clipboard.writeText(id);
                setNotifications((prev) => [
                  ...prev,
                  { id, msg: "Copied Room Id!" },
                ]);
              }
            }}
            className="w-fit md:w-full h-full py-2 !bg-orange-600/20 border !border-orange-600 !text-orange-400 text-sm font-bold uppercase hover:bg-orange-600/30 transition-all font-mono"
          >
            <span className="hidden md:flex">&gt; COPY_ROOM_ID</span>
            <span className="flex md:hidden">
              <BiCopy />
            </span>
          </button>
          <button
            className="md:hidden w-fit md:w-full h-full py-2 !bg-emerald-600/20 border !border-emerald-600 !text-emerald-400 text-sm font-bold uppercase hover:bg-emerald-600/30 transition-all font-mono"
            onClick={toggleShowRoomDetails}
          >
            <span>
              {isMobileAndShowRoomDetails ? <BiChevronDown /> : <BiMinus />}
            </span>
          </button>
          <div className="flex flex-col md:hidden items-center justify-center w-full text-sm ">
            <div className="flex items-center gap-2">
              <div className="text-orange-400 text-sm font-mono">
                {roomData.isPublic ? <BiLockOpen /> : <BiLock />}
              </div>

              <p className="text-gray-400 text-xs font-mono">
                End-to-end encrypted • {messages.length} messages
              </p>
            </div>
            {/* {
                  <div className="flex items-center justify-end gap-2 w-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs uppercase font-mono">
                      CONNECTED
                    </span>
                  </div>
                } */}
          </div>

          <button
            type="button"
            onClick={(e) => leaveRoom(e)}
            className="w-fit md:w-full h-full py-2 !bg-red-600/20 border !border-red-600 !text-red-400 text-sm font-bold uppercase hover:bg-red-600/30 transition-all font-mono"
          >
            <span className="hidden md:flex">&gt; DISCONNECT</span>
            <span className="flex md:hidden">
              <BsChevronBarLeft />
            </span>
          </button>
        </div>
      </motion.section>
    </>
  );
};

export default RoomDetails;
