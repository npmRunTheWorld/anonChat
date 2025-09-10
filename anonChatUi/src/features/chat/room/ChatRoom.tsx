import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type SetStateAction,
} from "react";
import { isMotionComponent, motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "@/components/ui/modals/Modal";
import { FaCrown } from "react-icons/fa";
import { useDeviceDetails } from "@/hooks/useDeviceDetails";
import { CiSettings } from "react-icons/ci";
import { BiCopy, BiLock, BiLockOpen } from "react-icons/bi";
import { BsBack, BsChevronBarLeft } from "react-icons/bs";

type RoomData = {
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

type SocketMsgObject = {
  serverType: string;
  username: string;
  port: string;
  userColor: string;
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

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const [isMobileLeftPanelClicked, setIsMobileLeftPanelClicked] =
    useState(false);
  const isMobileLeftPanelExpanded = isMobile && isMobileLeftPanelClicked;

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
  const ws = useRef<WebSocket | null>(null);

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
    console.log(msg);
    ws.current.send(msg);
    inputRef.current.value = "";
  };

  //lifecycle
  useEffect(() => {
    //app init
    let roomSSData = null;
    function appInit() {
      try {
        roomSSData = JSON.parse(sessionStorage.getItem(roomSSKey) ?? "");
        setRoomData((prev) => ({
          ...prev,
          title: roomSSData!.title ?? null,
          topics: roomSSData!.topics ?? null,
          isPublic: roomSSData!.isPublic ?? false,
        }));
      } catch (e) {
        setRoomData((prev) => ({
          ...prev,
        }));
      }

      if (!username || username == "") {
        navigate("/");
      }
    }

    appInit();
    //web socket connection
    ws.current = new WebSocket("ws://localhost:8000/chat");

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

      if (msgObj.serverType === "roomData") {
        //init room
        console.log(msgObj.data);
        if (typeof msgObj.data === "string") {
          return;
        }

        const roomUsers = msgObj.data as RoomData;
        /* sessionStorage.setItem(userSSKey, roomUsers.currUsernameAndId as string); */
        setUserName(roomUsers?.currUsername ?? ("" as string));

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

      if (msgObj.serverType === "message") {
        if (msgObj.error) {
          setIsError(msgObj.error);
        }

        setMessages((prev) => [...prev, { ...msgObj }]);
        return;
      }
    };

    return () => {
      ws.current!.close();
    };
  }, []);

  useEffect(() => {
    function scrollChatIntoView() {
      if (mainChatRef.current) {
        mainChatRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }
    }

    scrollChatIntoView();
  }, [mainChatRef.current]);

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

  function leaveRoom(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    ws.current?.close();
    sessionStorage.removeItem("anochat-username");
    navigate("/");
  }

  function handleLeftPanelOpen(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    console.log("clicking");
    setIsMobileLeftPanelClicked((prev) => (prev = !prev));
  }

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

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden font-mono">
      {/* Terminal grid background */}
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
        {/* Left Panel - Room Info & Users */}
        <motion.section
          className={`w-full h-3/8 md:h-full md:w-80 flex flex-col bg-gray-900/40 border border-red-900/30 `}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          }}
        >
          {/* Terminal Header */}
          <div className="p-4 border-b border-red-900/30 order-2 md:order-1">
            <div className="space-y-2">
              <div className="text-orange-400 font-mono">
                <span className="text-gray-500">&gt;</span> ROOM:{" "}
                {roomData?.title?.length ? (
                  <span className="text-white">{roomData?.title}</span>
                ) : (
                  <span className="text-muted">###</span>
                )}
              </div>
              <div className="text-gray-400 text-sm font-mono">
                <span className="text-gray-500">&gt;</span> ID:{" "}
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
          <div className="flex-1 p-4 overflow-y-auto order-3 md:order-2">
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
                    key={`room-user-tag-${user.username}-${userIndex}`}
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
          <div className="flex flex-row-reverse md:flex-col justify-between p-1 gap-2 md:p-4 border-t border-red-900/30 md:space-y-2 order-1 md:order-3">
            <button
              onClick={() => {
                if (id) {
                  navigator.clipboard.writeText(id);
                  alert("Room ID copied to clipboard!");
                }
              }}
              className="w-fit md:w-full h-full py-2 !bg-orange-600/20 border !border-orange-600 !text-orange-400 text-sm font-bold uppercase hover:bg-orange-600/30 transition-all font-mono"
            >
              <span className="hidden md:flex">&gt; COPY_ROOM_ID</span>
              <span className="flex md:hidden">
                <BiCopy />
              </span>
            </button>

            <div className="flex flex-col md:hidden items-center justify-center w-full text-sm ">
              <div className="flex items-center gap-2">
                {/* <div className="md:hidden">
                  <button
                    className="!bg-transparent !text-white !border-none cursor-pointer z-50"
                    role="button"
                    onClick={(e) => handleLeftPanelOpen(e)}
                  >
                    <CiSettings size={24} className="z-10" />
                  </button> 
                </div> */}
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

        {/* Main Chat Area */}
        <motion.section
          className={`flex-1 md:w-full flex flex-col bg-gray-900/20 border border-red-900/20`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Chat Header */}
          <div className="flex flex-wrap md:justify-center p-4 border-b border-red-900/30 bg-black/20 overflow-hidden">
            <div className="hidden md:flex flex-col items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {/* <div className="md:hidden">
                  <button
                    className="!bg-transparent !text-white !border-none cursor-pointer z-50"
                    role="button"
                    onClick={(e) => handleLeftPanelOpen(e)}
                  >
                    <CiSettings size={24} className="z-10" />
                  </button> 
                </div> */}
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <div className="text-4xl mb-4 font-mono">[ENCRYPTED]</div>
                  <p className="font-mono">No messages in secure channel</p>
                  <p className="text-sm text-gray-600 mt-2 font-mono">
                    Start the conversation...
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`flex ${
                      msg.username === username
                        ? "justify-end"
                        : "justify-start"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
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
                        <p className="text-white text-sm break-words font-mono">
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
              className="p-4 border-t border-red-900/30 bg-black/30"
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
                    className="w-full !pl-8 !pr-4 py-3 bg-black/50 border border-red-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-black/70 transition-all font-mono"
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
            </motion.form> /*  */
          }
        </motion.section>
      </div>
    </div>
  );
};

export default ChatRoom;
