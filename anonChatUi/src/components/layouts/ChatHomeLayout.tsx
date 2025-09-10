import { Link, Outlet, useLocation, useResolvedPath } from "react-router-dom";

const ChatHomeLayout = () => {
  //state

  //function
  const location = useLocation();
  console.log(location.pathname);
  const isChat = location.pathname.startsWith("/chat/");
  return (
    <div className="flex flex-col w-full h-full">
      {!isChat && (
        <nav className="p-4 flex gap-2 justify-center items-center h-fit bg-gradient-to-b from-black from-10% via-transparent via-85% to-red-500/20">
          <Link to={"/"}>
            <img
              src="/anon-chat-1.svg"
              className="w-15 h-15 md:w-20 md:h-20 bg-white/80"
            />
          </Link>
        </nav>
      )}

      <main className="flex flex-col min-h-screen">
        <Outlet />
      </main>

      {!isChat && (
        <footer className="bg-neutral-800 flex flex-col mt-10">
          <div className="flex justify-center items-center w-full h-full min-h-60">
            <div>
              <p className="w-full h-full">Anon Chat 2025</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default ChatHomeLayout;
