import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "@/components/ui/modals/Modal";

type SocketMsgObject = {
  username: string;
  time: string;
  txt: string;
  bgColor: string;
  error?: {
    code: string;
    msg?: string;
    resolver: string | string[];
  };
};

const ChatRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  //states
  const [messages, setMessages] = useState<SocketMsgObject[]>([]);
  const [username, setUserName] = useState<string>(
    sessionStorage.getItem("anochat-username") ?? ""
  );
  const [isError, setIsError] = useState<SocketMsgObject["error"]>();

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
    ws.current = new WebSocket("ws://localhost:8000/chat");

    if (!ws.current) {
      return;
    }

    if (!username || username == "") {
      navigate("/");
    }

    ws.current.onopen = () => {
      console.log("adding user with username: ", username, "to socket family");
      ws.current!.send(
        JSON.stringify({
          type: "userRecord",
          username: `${username}`,
          data: {
            roomId: id,
          },
        })
      );
    };

    ws.current.onmessage = (event) => {
      const msgObj: SocketMsgObject = JSON.parse(event.data);

      if (msgObj.error) {
        setIsError(msgObj.error);
      }

      setMessages((prev) => [...prev, { ...msgObj }]);
    };

    return () => {
      ws.current?.close();
    };
  }, [username]);

  //functions

  function updateUserName() {
    if (!userNameUpdateRef?.current?.value) return;
    const username = userNameUpdateRef.current.value;
    setUserName(username);
  }

  function checkIfUserNameIsTaken() {
    if (!userNameUpdateRef?.current?.value) return;
    const username = userNameUpdateRef.current.value;
    if(Array.isArray(isError?.resolver)){
      
    }
  }

  return (
    <div className="relative h-screen w-full flex items-start justify-center overflow-hidden">
      {/* Animated background overlay */}
      <motion.div
        className="absolute top-0 left-0 h-full w-[200%] bg-gradient-to-r from-white/5 via-white/10 to-white/5"
        animate={{ x: ["0%", "-50%"] }} // move left by 50% of its width
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      <Modal isOpen={!!isError?.code} onClose={() => null} type={"input"}>
        {isError?.code === "duplicateUser" && (
          <div className="flex flex-col gap-3 min-h-[25vh] text-sm text-black">
            <h2 className="text-xl font-semibold">
              Duplicate Username detected
            </h2>
            <div className="flex justify-between gap-6 mt-4">
              <input
                type="text"
                placeholder="Username"
                ref={userNameUpdateRef}
                className="w-3/4"
                onChange={checkIfUserNameIsTaken}
              />
              <button
                type="button"
                onClick={updateUserName}
                className="w-1/4 bg-black/30 hover:bg-black/10"
              >{`Update`}</button>
            </div>

            <p className=" text-red-700">
              {isError.msg && isError.msg != "" ? (
                <>{isError.msg}</>
              ) : (
                <>
                  Please update your user name so its different from the users
                  of this room
                </>
              )}
            </p>
          </div>
        )}
      </Modal>
      {/* Chat Container */}
      <div className="relative mt-15 z-10 w-full max-w-2xl h-[70vh] flex flex-col rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex-wrap wrap-anywhere">
        {/* Messages */}
        <div className="flex-1 w-full overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-white/40">No messages yet</p>
          ) : (
            messages.map((msg, i) => (
              <div
                className={` ${
                  msg.username === username
                    ? "flex justify-end"
                    : "flex justify-start"
                }`}
                key={i}
              >
                <div
                  className={`px-2 py-2 rounded-xl shadow-sm w-fit text-white ${
                    msg.username == username
                      ? "bg-yellow-800/15"
                      : "bg-white/15"
                  }`}
                  style={{
                    backgroundColor: `${msg?.bgColor ?? "bg-white/15"}`,
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-center items-center gap-2">
                      <span className="bg-black/30 rounded-md p-1 px-2 capitalize text-[0.65rem] min-w-fit">{`${msg?.username} :`}</span>
                      <span className="text-md">{`${msg?.txt}`}</span>
                    </div>
                    <div className="flex justify-end !text-[0.55rem]">
                      <span>{`${msg?.time}`}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="p-3 border-t border-white/20 flex gap-2"
        >
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-xl bg-white/15 text-white placeholder-white/40 outline-none"
            ref={inputRef}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
