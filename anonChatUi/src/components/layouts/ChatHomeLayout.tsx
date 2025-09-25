import { Link, Outlet, useLocation, useResolvedPath } from "react-router-dom";
import Navbar from "../ui/navbar/navbar";

const ChatHomeLayout = () => {
  //state

  //function
  const location = useLocation();
  console.log(location.pathname);
  const isChat = location.pathname.startsWith("/chat/");
  return (
    <div className="flex flex-col w-full h-full">
      {!isChat && (
        <Navbar />
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
