import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatHomeLayout from "@/components/layouts/ChatHomeLayout";
import ChatRoom from "../chat/room/ChatRoom";
import LoungePage from "../chat/ChatLounge/LoungePage";

const AnoChatRoutes = () => {
  //state

  //function

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatHomeLayout />}>
            <Route index element={<LoungePage />} />
            <Route path="chat/:id" element={<ChatRoom />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AnoChatRoutes;
