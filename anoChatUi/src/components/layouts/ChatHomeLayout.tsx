import ChatLounge from "@/features/chat/ChatLounge/ChatLounge";
import { Outlet } from "react-router-dom";

const ChatHomeLayout = () => {
  //state

  //function

  return (
    <>
      <nav className="border p-4">
        <h1>ANO CHAT</h1>
      </nav>

      <main className="flex flex-col mt-10">
        <Outlet />
        <div className="flex justify-end px-4">
          <h2 className="text-2xl text-yellow-200 px-4 bg-[var(--t-yellow)] p-4 cursor-pointer">+ Create New Chat Room</h2>
        </div>
        <div className="flex flex-col gap-10 p-2 mt-[10%]">
          <h2 className="text-2xl text-yellow-200 px-4 font-bold">Join A Chat Lounge</h2>
          <ChatLounge />
        </div>
      </main>

      <footer></footer>
    </>
  );
};

export default ChatHomeLayout;
