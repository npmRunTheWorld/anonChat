import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import Modal from "@/components/ui/modals/Modal";
import { useDeviceDetails } from "@/hooks/useDeviceDetails";
import NotificationStack, {
  type NotificationItem,
} from "@/components/ui/notifications/NotificationStack";
import ChatRoomUsernameEntryModal from "@/components/ui/modals/ChatRoomUsernameEntryModal";
import { apiDomain } from "@/utils/constants/envVar";
import RoomDetails from "./RoomDetails";
import MainChatArea from "./MainChatArea"; // ✅ new child component

export type RoomData = {
  users: {
    usernameAndId: string | null;
    username: string | null;
    port: string | null;
    userColor: string | null;
  }[];
  currUsername?: string | null;
  currUsernameAndId?: string | null;
  hostId: string;
  title?: string;
  topics?: string[];
  isPublic: boolean;
};

export type SocketMsgObject = {
  emitType: string;
  username: string;
  port: string;
  userColor?: string;
  textColor?: string;
  time: string;
  data: string | RoomData;
  bgColor: string;
  error?: {
    code: string;
    msg?: string;
    resolver: {
      [key: string]: boolean;
    };
  };
};

export type CustomWebSocket = WebSocket & {
  usernameAndId: string;
  username: string;
  port: string;
  roomId: string;
};

const ChatRoom = () => {
  const { id } = useParams();
  const userSSkey = "anochat-username";
  const roomSSKey = "anonchat-roomData";
  const userSS = sessionStorage.getItem(userSSkey);
  const { isMobile } = useDeviceDetails();

  const getUsernameAsString = () => {
    let username = "";
    try {
      username = JSON.parse(userSS ?? "");
    } catch (error) {
      username = userSS as string;
    }
    return username;
  };

  // --- State ---
  const [messages, setMessages] = useState<SocketMsgObject[]>([]);
  const [username, setUserName] = useState<string>(getUsernameAsString);
  const [roomData, setRoomData] = useState<RoomData>({
    users: [],
    currUsername: null,
    currUsernameAndId: null,
    hostId: "",
    title: "",
    topics: [],
    isPublic: false,
  });
  const [notifications, setNotifications] = useState<NotificationItem[] | []>(
    []
  );
  const [isShowRoomDetails, setIsShowRoomDetails] = useState(false);
  const isMobileAndShowRoomDetails = isMobile && isShowRoomDetails;

  const MAX_MSG = 50;
  const [maximumMsgShown, setMaximumMsgShown] = useState(MAX_MSG);

  const clearError = {
    code: "",
    resolver: {},
    msg: undefined,
  };
  const [isError, setIsError] =
    useState<Partial<SocketMsgObject["error"]>>(clearError);

  // --- Refs ---
  const mainChatRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const userNameUpdateRef = useRef<HTMLInputElement | null>(null);
  const messageBoxRef = useRef<HTMLDivElement | null>(null);
  const ws = useRef<WebSocket | null>(null);

  // --- Lifecycle ---
  useEffect(() => {
    let roomSSData: RoomData | null = null;
    function appInit() {
      try {
        roomSSData = JSON.parse(sessionStorage.getItem(roomSSKey) ?? "");
        setRoomData((prev) => ({
          ...prev,
          title: roomSSData?.title ?? prev.title,
          topics: roomSSData?.topics ?? prev.topics,
          isPublic: roomSSData?.isPublic ?? prev.isPublic,
        }));
      } catch (e) {
        setRoomData((prev) => ({ ...prev }));
      }
    }

    if (!username || username == "") return;
    appInit();

    // WebSocket connection
    ws.current = new WebSocket(
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${apiDomain}/chat`
    );
    if (!ws.current) return;

    ws.current.onopen = () => {
      if (!!roomSSData) {
        ws.current!.send(
          JSON.stringify({
            type: "userRecord",
            username: `${username}`,
            data: {
              roomId: id,
              title: roomSSData!.title,
              isPublic: roomSSData!.isPublic,
              topics: roomSSData!.topics,
            },
          })
        );
      } else {
        ws.current!.send(
          JSON.stringify({
            type: "userRecord",
            username: `${username}`,
            data: { roomId: id },
          })
        );
      }
    };

    ws.current.onmessage = (event) => {
      const msgObj: SocketMsgObject = JSON.parse(event.data);
      if (msgObj.emitType === "roomData") {
        if (typeof msgObj.data !== "string") {
          const roomUsers = msgObj.data as RoomData;
          setRoomData({
            ...roomUsers,
          });
        }
        return;
      }

      if (msgObj.emitType === "message") {
        if (msgObj.error) setIsError(msgObj.error);
        setMessages((prev) => [...prev, { ...msgObj }]);
        scrollToLastMessage();
      }
    };

    return () => {
      ws.current!.close();
    };
  }, [username]);

  useEffect(() => {
    let timeout: number | null = null;
    if (isMobile) {
      timeout = window.setTimeout(() => setIsShowRoomDetails(false), 3000);
    }
    scrollToLastMessage();
    return () => timeout && clearTimeout(timeout);
  }, []);

  // --- Functions ---
  function scrollToLastMessage() {
    const container = messageBoxRef.current;
    setTimeout(() => {
      if (container) {
        container.scrollTo({
          top: container.scrollHeight + container.offsetHeight,
          behavior: "smooth",
        });
      }
    }, 200);
  }

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!ws.current || !inputRef.current) return;
    const msg = inputRef.current.value.trim();
    if (!msg.length) return;

    ws.current.send(msg);
    inputRef.current.value = "";
    scrollToLastMessage();
  };

  function updateUserName() {
    if (!userNameUpdateRef?.current?.value) return;
    if (isError?.msg == "") {
      const newUserName = userNameUpdateRef.current.value;
      sessionStorage.setItem(userSSkey, newUserName);
      setIsError(clearError);
    }
  }

  function checkIfUserNameIsTaken() {
    if (!userNameUpdateRef?.current?.value) return;
    const newUserName = userNameUpdateRef.current.value;
    if (isError?.resolver && isError.resolver[newUserName]) {
      setIsError({ ...isError, msg: `username ${newUserName} already exists` });
    } else {
      setIsError({ ...isError, msg: "" });
    }
  }

  // --- Render ---
  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden font-mono">
      <NotificationStack
        notificationArr={notifications}
        setNotificationArr={setNotifications}
        notiStackClass="items-end pr-5 pt-2 !h-15"
      />

      {/* Effects */}
      <div
        className="absolute inset-0 opacity-5 z-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(239,68,68,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239,68,68,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
          pointerEvents: "none",
        }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent h-4 z-5"
        animate={{ y: ["0vh", "100vh"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Username entry */}
      <ChatRoomUsernameEntryModal username={username} setUsername={setUserName} />

      {/* Error modal */}
      <Modal isOpen={!!isError?.code} onClose={() => null} type="input">
        {isError?.code === "duplicateUser" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-red-400 uppercase font-mono">
              ERROR_DUPLICATE_USER
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="new_username"
                ref={userNameUpdateRef}
                className="flex-1 px-0 py-2 bg-transparent border-b-2 border-red-900 text-orange-300 focus:outline-none focus:border-orange-500 font-mono"
                onChange={checkIfUserNameIsTaken}
              />
              <button
                type="button"
                onClick={updateUserName}
                className="px-4 py-2 bg-orange-600 text-black font-bold uppercase text-sm hover:bg-orange-500 font-mono"
              >
                UPDATE
              </button>
            </div>
            <p className="text-red-400 text-sm font-mono">
              {isError.msg || "Username conflict detected. Choose different identifier."}
            </p>
          </div>
        )}
      </Modal>

      {/* Main layout */}
      <div
        className="flex flex-col md:flex-row h-[100dvh] w-full gap-2"
        id="main-chat"
        ref={mainChatRef}
      >
        {/* Sidebar */}
        <RoomDetails
          ws={ws}
          roomData={roomData}
          username={username}
          isMobileAndShowRoomDetails={isMobileAndShowRoomDetails}
          messages={messages}
          id={id}
          setNotifications={setNotifications}
          setIsShowRoomDetails={setIsShowRoomDetails}
        />

        {/* Main Chat Area */}
        <MainChatArea
          roomData={roomData}
          messages={messages}
          username={username}
          MAX_MSG={MAX_MSG}
          maximumMsgShown={maximumMsgShown}
          setMaximumMsgShown={setMaximumMsgShown}
          sendMessage={sendMessage}
          inputRef={inputRef}
          messageBoxRef={messageBoxRef}
          isMobileAndShowRoomDetails={isMobileAndShowRoomDetails}
        />
      </div>
    </div>
  );
};

export default ChatRoom;
