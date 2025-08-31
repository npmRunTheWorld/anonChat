import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatHomeLayout from "@/components/layouts/ChatHomeLayout";
import ChatRoom from "../chat/chatRoom/ChatRoom";

const AnoChatRoutes = () => {
  //state

  //function

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<ChatHomeLayout />} />
          <Route path="/chat/:id" element={ <ChatRoom /> } />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AnoChatRoutes;
