import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import CreateRoomModals from "@/components/ui/modals/CreateRoomModals";
import { useNavigate } from "react-router-dom";
import { clearStorageRoomData, setStorageRoomData, setStorageUsername } from "@/utils/fx/sessionStorage";

const ChatLounge = () => (
  <div className="space-y-4">
    {[
      {
        id: 1,
        name: "midnight_whispers",
        users: 23,
        topic: "late night thoughts",
        //mood: "🌙",
      },
      {
        id: 2,
        name: "neon_shadows",
        users: 67,
        topic: "cyberpunk discussions",
        //mood: "⚡",
      },
      {
        id: 3,
        name: "coffee_strangers",
        users: 12,
        topic: "random conversations",
        //mood: "☕",
      },
      {
        id: 4,
        name: "void_talkers",
        users: 89,
        topic: "existential chats",
        //mood: "🌌",
      },
      {
        id: 5,
        name: "digital_ghosts",
        users: 45,
        topic: "tech & philosophy",
        //mood: "👻",
      },
      {
        id: 6,
        name: "broken_pixels",
        users: 34,
        topic: "art & creativity",
        //mood: "🎨",
      },
    ].map((room, i) => (
      <motion.div
        key={room.id}
        className="group relative"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: i * 0.1, duration: 0.6 }}
      >
        <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-red-950/30 to-transparent border-l-4 border-orange-500 hover:border-l-8 transition-all duration-500 hover:bg-red-900/20">
          {/* <div className="text-4xl">{room.//mood}</div> */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-orange-400 text-lg">
                #{room.name}
              </span>
              <div className="px-2 py-1 bg-red-900/50 text-red-200 text-xs rounded font-mono">
                {room.users} anon
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-1 font-mono">{room.topic}</p>
          </div>
          <motion.button
            className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-orange-600/80 text-black font-bold text-sm rounded-none hover:bg-orange-500 transition-all"
            whileHover={{ x: 5 }}
          >
            ENTER →
          </motion.button>
        </div>
      </motion.div>
    ))}
  </div>
);

const LoungeAnalytics = () => {
  const stats = [
    { value: "127", label: "rooms", color: "text-red-400" },
    { value: "2.4k", label: "shadows online", color: "text-orange-400" },
    { value: "18.2k", label: "total users", color: "text-red-300" },
    { value: "156k", label: "secrets shared", color: "text-orange-300" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.2 }}
        >
          <div className={`text-4xl font-mono font-black ${stat.color} mb-2`}>
            {stat.value}
          </div>
          <div className="text-gray-500 text-sm font-mono uppercase tracking-widest">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const LoungePage = () => {
  const navigate = useNavigate();

  const [isModalShowing, setIsModalShowing] = useState(false);
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  function goToChatRoom(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = form.get("username") ?? "";
    const roomId = form.get("roomId") ?? "";

    if (!username) {
      console.log(
        "ERROR: a username must be present, please enter your username before entering another room"
      );
      return;
    }

    if (!roomId) {
      console.log(
        "ERROR: a room ID must be present, please enter a room id to go the room"
      );
    }

    setStorageUsername(JSON.stringify(username));
    clearStorageRoomData();
    navigate(`/chat/${roomId}`);
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
              transition={{ delay: 1 }}
            >
              <motion.button
                onClick={() => setIsModalShowing(true)}
                className="md:col-span-2 p-8 bg-gradient-to-r from-neutral-500 to-red-100 text-black font-mono font-black text-xl uppercase tracking-widest hover:to-red-500 hover:from-gray-800 transition-all duration-300 transform hover:skew-x-2"
              >
                + Launch New Room
              </motion.button>

              <form className="space-y-4" onSubmit={goToChatRoom}>
                <div className="flex gap-1">
                  <input
                    className="w-full px-0 py-4 bg-transparent border-b-2 border-red-900 text-orange-300 font-mono text-lg focus:outline-none focus:border-orange-500 placeholder-gray-600"
                    placeholder="Username"
                    type="text"
                    onChange={(e) => setUsername(e.target.value)}
                    name="username"
                  />
                  <input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-0 py-4 bg-transparent border-b-2 border-red-900 text-orange-300 font-mono text-lg focus:outline-none focus:border-orange-500 placeholder-gray-600"
                    placeholder="Room ID..."
                    type="text"
                    name="roomId"
                  />
                </div>
                <button
                  className="w-full py-3 border-2 border-orange-500 text-orange-500 font-mono uppercase text-sm hover:bg-orange-500 hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={!roomId.trim() || !username.trim()}
                  type="submit"
                >
                  {roomId.trim().length > 0 && username.trim().length > 0
                    ? ">> ENTER ROOM"
                    : "ENTER A USERNAME & ROOM ID"}
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
              <ChatLounge />
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
