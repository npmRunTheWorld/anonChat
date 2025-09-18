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

  //states
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
  const messageSliceStartPointer =
    messages.length - maximumMsgShown > 0
      ? messages.length - maximumMsgShown
      : 0;

  const clearError = {
    code: "",
    resolver: {},
    msg: undefined,
  };
  const [isError, setIsError] =
    useState<Partial<SocketMsgObject["error"]>>(clearError);

  //refs
  const mainChatRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const userNameUpdateRef = useRef<HTMLInputElement | null>(null);
  const messageBoxRef = useRef<HTMLDivElement | null>(null);
  const ws = useRef<WebSocket | null>(null);

  //lifecycle
  useEffect(() => {
    //app init
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
        setRoomData((prev) => ({
          ...prev,
        }));
      }
    }

    if (!username || username == "") {
      return;
    }

    appInit();

    //web socket connection
    console.log("api domain", apiDomain);
    ws.current = new WebSocket(`ws://${apiDomain}/chat`);

    if (!ws.current) {
      return;
    }

    //INIT
    ws.current.onopen = () => {
      console.log("adding user with username: ", username, "to socket family");
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
            data: {
              roomId: id,
            },
          })
        );
      }
    };

    ws.current.onmessage = (event) => {
      const msgObj: SocketMsgObject = JSON.parse(event.data);

      if (msgObj.emitType === "roomData") {
        //init room
        console.log(msgObj.data);
        if (typeof msgObj.data === "string") {
          return;
        }

        const roomUsers = msgObj.data as RoomData;

        setRoomData((prev) => ({
          ...prev,
          users: roomUsers.users,
          currUsername: roomUsers.currUsername,
          currUsernameAndId: roomUsers.currUsernameAndId,
          hostId: roomUsers.hostId,
          isPublic: roomUsers.isPublic,
          title: roomUsers.title,
          topics: roomUsers.topics,
        }));
        return;
      }

      if (msgObj.emitType === "message") {
        if (msgObj.error) {
          setIsError(msgObj.error);
        }

        setMessages((prev) => [...prev, { ...msgObj }]);
        scrollToLastMessage();
        return;
      }
    };

    return () => {
      ws.current!.close();
    };
  }, [username]);

  useEffect(() => {
    let roomDetailsMobileShowTimeout: number | null = null;

    function scrollChatIntoView() {
      if (mainChatRef.current) {
        mainChatRef.current.scrollIntoView({
          behavior: "smooth",
        });
      }
      scrollToLastMessage();
    }

    function mobileOnlyAutoHideRoomDetails() {
      if (isMobile) {
        roomDetailsMobileShowTimeout = window.setTimeout(() => {
          setIsShowRoomDetails(false);
        }, 3000);
      }
    }

    scrollChatIntoView();
    mobileOnlyAutoHideRoomDetails();

    return () => {
      if (roomDetailsMobileShowTimeout !== null) {
        clearTimeout(roomDetailsMobileShowTimeout);
      }
    };
  }, []);

  //functions
  function setSessionUsername(name: string) {
    sessionStorage.setItem(userSSkey, name);
  }
  function updateUserName() {
    if (!userNameUpdateRef?.current?.value) return;

    if (isError?.msg == "") {
      const newUserName = userNameUpdateRef.current.value;
      setSessionUsername(newUserName);

      //clear error
      setIsError(clearError);
    }
  }

  function checkIfUserNameIsTaken() {
    if (!userNameUpdateRef?.current?.value) return;
    const newUserName = userNameUpdateRef.current.value;

    //since the resolver has a map of username keys of the current users in the room with values of true
    //this evaluates to true if username exists within map
    if (isError?.resolver && isError.resolver[newUserName]) {
      setIsError((prev) => ({
        ...prev,
        msg: `username ${newUserName} already exists`,
      }));

      return;
    } else {
      setIsError((prev) => ({
        ...prev,
        msg: "",
      }));
    }
  }

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();

    if (!ws.current) {
      alert(
        "unable to send message please go back to lounge and create a new chat"
      );
      return;
    }

    if (!inputRef.current) {
      console.log("Error input field not found, msg not send");
      return;
    }

    const msg = inputRef?.current?.value ?? "";
    if (!msg.length) return;

    console.log(msg);
    ws.current.send(msg);
    inputRef.current.value = "";

    scrollToLastMessage();
  };

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

  /* function handleLeftPanelOpen(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    console.log("clicking");
    setIsMobileLeftPanelClicked((prev) => (prev = !prev));
  } */

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden font-mono">
      {/* Terminal grid background */}
      <NotificationStack
        notificationArr={notifications}
        setNotificationArr={setNotifications}
        notiStackClass="items-end pr-5 pt-2 !h-15"
      />

      <div
        className="absolute inset-0 opacity-5 z-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(239, 68, 68, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "30px 30px",
          pointerEvents: "none",
        }}
      />

      {/* Animated scanlines */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent h-4 z-5"
        animate={{ y: ["0vh", "100vh"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
          pointerEvents: "none",
        }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-4 z-5"
        animate={{ y: ["0vh", "100vh"] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          delay: 0.05,
        }}
        style={{
          pointerEvents: "none",
        }}
      />
      <ChatRoomUsernameEntryModal
        username={username}
        setUsername={setUserName}
      />
      {/* UPDATE USER NAME MODAL */}
      <Modal isOpen={!!isError?.code} onClose={() => null} type={"input"}>
        {isError?.code === "duplicateUser" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500"></div>
              <h2 className="text-xl font-bold text-red-400 uppercase font-mono">
                ERROR_DUPLICATE_USER
              </h2>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="new_username"
                ref={userNameUpdateRef}
                className="flex-1 px-0 py-2 bg-transparent border-b-2 border-red-900 text-orange-300 focus:outline-none focus:border-orange-500 placeholder-gray-600 font-mono"
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
              {isError.msg && isError.msg != "" ? (
                <>{isError.msg}</>
              ) : (
                <>Username conflict detected. Choose different identifier.</>
              )}
            </p>
          </div>
        )}
      </Modal>
      {/* MAIN */}
      <div
        className="flex flex-col md:flex-row h-screen w-full p-6 gap-2 md:gap-2"
        id="main-chat"
        ref={mainChatRef}
      >
        {/*Room Info & Users list*/}
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
        <motion.section
          className={`h-7/10 md:h-full md:flex-1 md:w-4/5 flex flex-col bg-gray-900/20 border border-red-900/20 ${
            isMobileAndShowRoomDetails && "h-full"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Chat Header */}
          <div className="hidden md:flex flex-wrap md:justify-center p-4 border-b border-red-900/30 bg-black/20 overflow-hidden">
            <div className="hidden md:flex flex-col items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="text-orange-400 text-lg font-mono">
                  {roomData.isPublic ? "[PUBLIC]" : "[SECURE]"}
                </div>
                <div>
                  <h2 className="text-white font-bold uppercase font-mono">
                    ANONYMOUS_CHANNEL
                  </h2>
                  <p className="text-gray-400 text-xs font-mono">
                    End-to-end encrypted • {messages.length} messages
                  </p>
                </div>
              </div>
              {
                <div className="flex items-center justify-end gap-2 w-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-xs uppercase font-mono">
                    CONNECTED
                  </span>
                </div>
              }
            </div>
          </div>

          {/* Messages Area */}
          {
            <div
              className="h-9/10 overflow-y-auto p-4 space-y-4 safe-scroll"
              ref={messageBoxRef}
            >
              {messages.length > MAX_MSG && (
                <div
                  role="button"
                  className="flex w-full justify-center items-center underline underline-offset-3 cursor-pointer text-muted hover:text-orange-600"
                  onClick={() =>
                    setMaximumMsgShown((prev) => (prev += MAX_MSG))
                  }
                >
                  ...load more messages
                </div>
              )}
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <div className="text-4xl mb-4 font-mono">[ENCRYPTED]</div>
                  <p className="font-mono">No messages in secure channel</p>
                  <p className="text-sm text-gray-600 mt-2 font-mono">
                    Start the conversation...
                  </p>
                </div>
              ) : (
                messages.slice(messageSliceStartPointer).map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`flex ${
                      msg.username === username
                        ? "justify-end"
                        : "justify-start"
                    }`}
                    initial={{ opacity: 0.1, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <div
                      className={`max-w-[70%] ${
                        msg.username === username ? "order-2" : "order-1"
                      }`}
                    >
                      <div
                        className="p-3 border-l-4"
                        style={{
                          borderLeftColor: msg.userColor,
                          backgroundColor: msg.userColor,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 bg-black/50 text-gray-300 font-mono">
                            {msg.username}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {msg.time}
                          </span>
                        </div>
                        <p
                          className={`text-white text-sm break-words font-mono`}
                          style={{ color: msg?.textColor }}
                        >
                          {msg?.data}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          }

          {/* Message Input */}
          {
            <motion.form
              onSubmit={sendMessage}
              className={`h-1/10 p-4 border-t mt-auto border-red-900/30 bg-black/30 ${
                isMobileAndShowRoomDetails && "h-auto"
              }`}
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 text-sm font-mono">
                    &gt;
                  </span>
                  <input
                    type="text"
                    placeholder="Enter message..."
                    className={`w-full !pl-8 !pr-4 py-3 bg-black/50 border border-red-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-black/70 transition-all font-mono ${
                      isMobileAndShowRoomDetails && "py-0 h-fit"
                    }`}
                    ref={inputRef}
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-600 text-black font-bold uppercase text-sm hover:bg-orange-500 transition-all font-mono"
                >
                  SEND
                </button>
              </div>
            </motion.form>
          }
        </motion.section>
      </div>
    </div>
  );
};

export default ChatRoom;
