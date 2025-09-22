import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import CreateRoomModals from "@/components/ui/modals/CreateRoomModals";
import { useNavigate } from "react-router-dom";
import {
  clearStorageRoomData,
  getStorageUsername,
} from "@/utils/fx/sessionStorage";
import { validate as uuidValidate } from "uuid";
import { apiUrl } from "@/utils/constants/envVar";
import { BiUserCircle } from "react-icons/bi";
import type { StatsType } from "@/assets/types/apiTypes";

const ChatLounge = ({ roomsObj }: { roomsObj: Record<string, any> }) => {
  const rooms = Object.entries(roomsObj);
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 space-y-4">
      {rooms.length == 0 ? (
        <p className="text-muted">No Public Rooms Available</p>
      ) : (
        rooms.map(([roomId, room], i) => (
          <motion.div
            key={roomId}
            className="group relative"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
          >
            <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-red-950/30 to-transparent border-l-4 border-orange-500 hover:border-l-8 transition-all duration-500 hover:bg-red-900/20">
              {/* <div className="text-4xl">{room.//mood}</div> */}
              <div className="flex-1">
                <div className="flex flex-col justify-center items-start gap-3">
                  <div className="flex  gap-2 justify-center items-center px-2 py-1 bg-red-900/50 text-red-200 text-xs rounded font-mono">
                    <BiUserCircle /> {room.anonUsersCount} anon
                  </div>
                  <div className="flex gap-3">
                    <span className="font-mono text-orange-400 text-md">
                      <span className="!text-white">Title: </span>
                      {room?.roomTitle ?? "No Title Given"}
                    </span>
                  </div>
                  <span className="font-mono text-orange-400 text-lg text-sm">
                    <span className="!text-white">ID:</span> {roomId}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1 font-mono">
                  {room.roomTopics}
                </p>
              </div>
              <motion.button
                className="opacity-100 md:opacity-1 group-hover:opacity-100 px-4 py-2 !bg-orange-600/80 text-black font-bold text-sm rounded-none hover:!bg-orange-500 transition-all"
                whileHover={{ x: 5 }}
                onClick={() => navigate(`chat/${roomId}`)}
              >
                ENTER ROOM →
              </motion.button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

// Assuming you have a component to display the stats, like a StatsCard

const LoungeAnalytics = () => {
  // Use state to store the fetched stats data
  const [loungeStats, setLoungeStats] = useState<StatsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  let refreshRate = 20000; //ms

  // Utility function to format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num;
  };

  useEffect(() => {
    async function getSiteDetails() {
      try {
        const siteDetailsRes = await fetch(
          `${apiUrl}/loungeInfo/getSiteDetails`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const siteDetails = await siteDetailsRes.json();
        // Update the state with the new data
        setLoungeStats(siteDetails.data); // Assuming your successResponse returns { data: {...} }
      } catch (error) {
        console.error("Failed to fetch site details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    const schedulePageRefresh = () => {
      const timeout = setTimeout(() => {
        getSiteDetails();
        if (refreshRate > 180000) {
          //reset rate when the exponential backoff reaches over 10mins
          refreshRate = 20000;
        } else {
          refreshRate = refreshRate * 2;
        }

        schedulePageRefresh();
      }, refreshRate);

      return timeout;
    };

    getSiteDetails();
    const timeoutId = schedulePageRefresh();

    return () => clearTimeout(timeoutId);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Stagger the animation of the children by 0.2 seconds
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      className="pt-4 pb-10 grid grid-cols-2 md:flex  md:flex-row justify-center items-center gap-8 md:gap-32 my-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : loungeStats ? (
        [
          {
            value: formatNumber(loungeStats.activeRooms),
            label: "rooms",
            color: "text-red-400",
          },
          {
            value: formatNumber(loungeStats.shadowsOnline),
            label: "shadows online",
            color: "text-orange-400",
          },
          {
            value: formatNumber(loungeStats.totalUsers),
            label: "total users",
            color: "text-red-300",
          },
          {
            value: formatNumber(loungeStats.secretsShared),
            label: "secrets shared",
            color: "text-orange-300",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center"
            variants={itemVariants} // Apply the child animation variants
          >
            <div className={`text-4xl font-mono font-black ${stat.color}`}>
              {stat.value}
            </div>
            <span className="text-gray-500 text-sm font-mono uppercase tracking-wider">
              {stat.label}
            </span>
          </motion.div>
        ))
      ) : (
        <div className="text-gray-500">Failed to load data.</div>
      )}
    </motion.div>
  );
};

const LoungePage = () => {
  const navigate = useNavigate();
  const [isModalShowing, setIsModalShowing] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [roomsObj, setRoomsObj] = useState({});
  const [fieldError, setFieldError] = useState<Record<string, any>>({});

  useEffect(() => {
    async function getRoomInfo() {
      console.log("api route: ", `${apiUrl}/loungeInfo/getRooms`);
      const roomRes = await fetch(`${apiUrl}/loungeInfo/getRooms`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const roomData = await roomRes.json();
      setRoomsObj(roomData.data);
      console.log(roomData);
    }

    getRoomInfo();
  }, []);

  function goToChatRoom(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const roomId = form.get("roomId") ?? "";
    /* const username = form.get("username") ?? ""; */

    /*  if (!username) {
      console.log(
        "ERROR: a username must be present, please enter your username before entering another room"
      );
      return;
    } */

    const getRoomIdFromUrl = String(roomId).split("/chat/")[1] ?? undefined;
    console.log(
      "the domain infos: ",
      getRoomIdFromUrl,
      `chat/${getRoomIdFromUrl}`
    );

    /* setStorageUsername(JSON.stringify(username)); */
    clearStorageRoomData();

    //url+roomId
    if (getRoomIdFromUrl) {
      if (!uuidValidate(getRoomIdFromUrl)) {
        setFieldError((prev) => ({ ...prev, roomId: "Invalid room id" }));
        return;
      }

      navigate(`chat/${getRoomIdFromUrl}`);
      return;
    }
    //standard roomId
    if (!uuidValidate(roomId)) {
      setFieldError((prev) => ({ ...prev, roomId: "Invalid room id" }));
      return;
    }
    navigate(`chat/${roomId}`);
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Unique grid pattern background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Diagonal sweep animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-transparent to-orange-900/5"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(127, 29, 29, 0.1) 0%, transparent 50%, rgba(154, 52, 18, 0.05) 100%)",
            "linear-gradient(225deg, rgba(127, 29, 29, 0.1) 0%, transparent 50%, rgba(154, 52, 18, 0.05) 100%)",
            "linear-gradient(45deg, rgba(127, 29, 29, 0.1) 0%, transparent 50%, rgba(154, 52, 18, 0.05) 100%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <CreateRoomModals
        isModalShowing={isModalShowing}
        setIsModalShowing={setIsModalShowing}
      />

      <section className="relative z-10">
        {/* Hero section */}
        <div className="relative h-[65vh] overflow-hidden">
          <img
            src="/images/bg-orange.jpg"
            className="w-full h-full object-cover"
            alt="Anonymous Chat Background"
          />

          {/* Unique diagonal cut overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
            }}
          />

          {/* Glitch-style text */}
          <div className="absolute inset-0 flex flex-col justify-center items-start px-12">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="relative">
                <h1 className="text-6xl md:text-8xl font-black text-red-500 font-mono leading-tight">
                  ANON
                </h1>
                <h1 className="text-6xl md:text-8xl font-black text-orange-400 font-mono leading-tight -mt-4">
                  CHAT
                </h1>
                <motion.div
                  className="absolute top-0 left-0 text-6xl md:text-8xl font-black text-white font-mono leading-tight opacity-20"
                  animate={{ x: [0, 2, -2, 0] }}
                  transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  ANON
                </motion.div>
              </div>
              <div className="mt-6 max-w-lg">
                <p className="text-gray-300 text-lg font-mono">
                  <span className="text-orange-500">&gt;</span> No names. No
                  history. Just conversations.
                </p>
                <p className="text-gray-500 text-sm font-mono mt-2">
                  <span className="text-red-500">&gt;</span> Enter the digital
                  underground of anonymous discourse.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16">
          {/* Analytics with terminal aesthetic */}
          <div className="mb-16">
            <motion.div
              className="grid md:grid-cols-3 gap-8 items-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <motion.button
                onClick={() => setIsModalShowing(true)}
                className="md:col-span-2 p-8 bg-gradient-to-r from-neutral-500 via-white to-neutral-500 text-black font-mono font-black text-xl uppercase tracking-widest hover:to-red-500 hover:via-black hover:from-red-500 hover:!text-orange-500 transition-all duration-300 transform hover:skew-x-2"
              >
                + Launch New Room
              </motion.button>

              <form className="space-y-4" onSubmit={goToChatRoom}>
                <div className="flex flex-col">
                  {/* <input
                    className="w-full px-0 py-4 bg-transparent border-b-2 border-red-900 text-orange-300 font-mono text-lg focus:outline-none focus:border-orange-500 placeholder-gray-600"
                    placeholder="Username"
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    name="username"
                    value={username}
                  /> */}
                  <input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-0 py-4 bg-transparent border-b-2 border-red-900 text-orange-300 font-mono text-lg focus:outline-none focus:border-orange-500 placeholder-gray-600"
                    placeholder="Room ID..."
                    type="text"
                    name="roomId"
                  />
                  <motion.span
                    className="flex justify-end h-2 text-red-600 text-sm capitalize"
                    animate={{
                      color: [
                        "var(--color-red-800)",
                        "var(--color-orange-500)",
                        "var(--color-pink-800)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  >
                    {fieldError.roomId && <p>{fieldError.roomId}</p>}
                  </motion.span>
                </div>
                <button
                  className="w-full py-3 border-2 !bg-white !border-orange-500 !text-orange-500 font-mono uppercase text-sm hover:!bg-orange-500 hover:!text-black transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:!text-muted disabled:hover:!bg-white"
                  disabled={!roomId.trim()}
                  type="submit"
                >
                  {roomId.trim().length > 0
                    ? ">> ENTER ROOM"
                    : "ENTER A ROOM ID"}
                </button>
              </form>
            </motion.div>
          </div>

          {/* LOUNGE ANALYTICS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <LoungeAnalytics />
          </motion.div>

          {/* Rooms section with terminal list style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-mono font-black text-white mb-2">
                Public Rooms
              </h2>
              <div className="h-1 w-32 bg-red-600"></div>
            </div>

            <div className="bg-gray-900/30 border border-red-900/50 p-6">
              <div className="flex items-center gap-2 mb-4 text-xs font-mono text-gray-500">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>SYSTEM ONLINE - {new Date().toLocaleTimeString()}</span>
              </div>
              <ChatLounge roomsObj={roomsObj} />
            </div>
          </motion.div>

          {/* Start Session */}
          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className="inline-block border-2 border-orange-500 p-8 transform rotate-1">
              <div className="transform -rotate-1">
                <h3 className="text-2xl font-mono text-orange-400 mb-4">
                  READY TO DISAPPEAR?
                </h3>
                <p className="text-gray-400 font-mono text-sm mb-6">
                  Join the conversation. Leave no trace.
                </p>
                <button
                  onClick={() => setIsModalShowing(true)}
                  className="px-8 py-3 bg-orange-600 text-black font-mono font-bold uppercase hover:bg-orange-500 transition-all"
                >
                  &gt; START_SESSION
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LoungePage;
