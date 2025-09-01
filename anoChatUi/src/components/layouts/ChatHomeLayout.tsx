import { Link, Outlet } from "react-router-dom";


const ChatHomeLayout = () => {
  //state
  //function

  return (
    <div className="w-full h-full">
      <nav className="p-4 flex gap-2 justify-center items-center">
        <Link to={"/"}>
        <img src="/anon-chat-1.svg" className="w-20 h-20 bg-white/80" />
        </Link>
      </nav>

      <main className="flex flex-col mt-10 min-h-screen">
        <Outlet />
      </main>

      <footer className="bg-neutral-800 flex flex-col mt-10">
        <div className="flex justify-center items-center w-full h-full min-h-60">
          <div>
            <p className="w-full h-full">Anon Chat 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChatHomeLayout;
