import { useState } from "react";
import ChatLounge from "@/features/chat/ChatLounge/ChatLounge";
import LoungeAnalytics from "@/features/chat/ChatLounge/LoungeAnalytics";
import CreateRoomModals from "@/components/ui/modals/CreateRoomModals";
import { motion } from "framer-motion";
const LoungePage = () => {
  //state
  const [isModalShowing, setIsModalShowing] = useState(false);

  //function

  return (
    <div className="relative pt-10 w-full overflow-hidden">
      <motion.div
        className="absolute -z-1 top-0 left-0 h-full w-[200%] bg-gradient-to-r from-blue-800/5 via-white/10 to-blue-800/5"
        animate={{ x: ["0%", "-50%"] }} // move left by 50% of its width
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      <CreateRoomModals
        isModalShowing={isModalShowing}
        setIsModalShowing={setIsModalShowing}
      />
      <div className="flex justify-between px-4 h-[25vh]">
        <LoungeAnalytics />

        <div className="w-1/3 flex flex-col gap-10 justify-center items-center">
          <button onClick={() => setIsModalShowing(true)}>
            <h2 className="text-xl text-white px-4 p-2 rounded-sm cursor-pointer bg-[var(--t-yellow)] hover:bg-[var(--t-yellow-1)] h-fit w-80">
              + Create New Chat Room
            </h2>
          </button>
          <input
            className="text-xl text-white px-4 p-2 rounded-sm bg-[var(--t-yellow)] hover:bg-[var(--t-yellow-1)] h-fit w-80"
            placeholder="Enter a room id"
            type="text"
          />
        </div>
      </div>
      <div className="flex flex-col gap-10 p-2 mt-10">
        <h2 className="text-2xl text-white px-4 font-bold">
          Join A Chat Lounge
        </h2>
        <ChatLounge />
      </div>
    </div>
  );
};

export default LoungePage;
