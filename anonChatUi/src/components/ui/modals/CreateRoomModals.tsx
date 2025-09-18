import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Modal from "./Modal";

export type CreateRoomModalsProps = {
  isModalShowing: boolean;
  setIsModalShowing: Dispatch<SetStateAction<boolean>>;
};

const CreateRoomModals = ({
  isModalShowing,
  setIsModalShowing,
}: CreateRoomModalsProps) => {
  //states
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(false);
  const handleToggle = () => {
    setIsPublic(!isPublic);
  };
  useEffect(() => {
    setIsPublic(false);
  }, []);
  // function
  async function handleRoomCreation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const username = formData.get("username");

    if (!username) {
      console.log("user name was not entered");
      return;
    }

    const topics = formData.get("topics");
    let title = formData.get("roomTitle");

    if (!title || title == "") {
      title = `${username}'s room`;
    }

    sessionStorage.setItem("anochat-username", JSON.stringify(username));
    sessionStorage.setItem(
      "anonchat-roomData",
      JSON.stringify({
        title,
        topics,
        isPublic,
      })
    );

    // You can send this to your server here:
    // await fetch("/api/rooms", { method: "POST", body: JSON.stringify({ title, description }) });

    const roomId = uuidv4();
    console.log("Creating room with:", {
      username,
      roomUrl: `chat/${roomId}`,
      title,
      topics,
    });
    navigate(`chat/${roomId}`);
    setIsModalShowing(false);
  }

  if (!isModalShowing) return null;

  return (
    <Modal
      isOpen={isModalShowing}
      setIsOpen={setIsModalShowing}
      type={"input"}
      title="Create Room"
    >
      {/* Fields */}
      <form className="space-y-6" onSubmit={(e) => handleRoomCreation(e)}>
        <div>
          <label
            className="block text-gray-400 text-xs font-mono uppercase mb-2"
            htmlFor="username"
          >
            User Name (required)
          </label>
          <input
            type="text"
            placeholder=""
            id="username"
            name="username"
            className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-red-900 text-orange-300 font-mono focus:outline-none focus:border-orange-500 placeholder-gray-600"
            required
          />
        </div>

        <div>
          <label
            className="block text-gray-400 text-xs font-mono uppercase mb-2"
            htmlFor="roomTitle"
          >
            Room Codename (OPTIONAL)
          </label>
          <input
            type="text"
            placeholder="Private Meeting"
            id="roomTitle"
            name="roomTitle"
            className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-red-900 text-orange-300 font-mono focus:outline-none focus:border-orange-500 placeholder-gray-600"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-xs font-mono uppercase mb-2">
            Topic (optional)
          </label>
          <input
            type="text"
            id="topics"
            name="topics"
            placeholder="Infrastructure, Share Holder Meeting, ..."
            className="w-full px-0 py-3 bg-transparent border-0 border-b-2 border-red-900 text-orange-300 font-mono focus:outline-none focus:border-orange-500 placeholder-gray-600"
          />
        </div>

        {/* Options */}
        <div className="flex justify-end items-center gap-5">
          <div className="flex gap-1 justify-center items-center">
            <input
              role="checkbox"
              type="checkbox"
              id="statusToggle"
              checked={!isPublic}
              onChange={handleToggle}
              className="rounded-md w-3 h-3"
            />
            <span className={`${!isPublic && "text-red-500"}`}>
              {!isPublic ? "Private" : "Public"}
            </span>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            onClick={() => setIsModalShowing(false)}
            className="flex-1 py-3 bg-transparent border border-gray-600 text-gray-400 font-mono uppercase text-sm hover:bg-gray-800 transition-all"
          >
            Cancel
          </button>
          <button
            role="button"
            type="submit"
            className="flex-1 py-3 bg-orange-600 text-black font-mono uppercase text-sm font-bold hover:bg-orange-500 transition-all"
          >
            Launch Room
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* */
export default CreateRoomModals;
