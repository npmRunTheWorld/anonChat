import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Form, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

type CreateRoomModalsProps = {
  isModalShowing: boolean;
  setIsModalShowing: Dispatch<SetStateAction<boolean>>;
};

const CreateRoomModals = ({
  isModalShowing,
  setIsModalShowing,
}: CreateRoomModalsProps) => {
  //states
  const navigate = useNavigate();

  // function
  async function handleRoomCreation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const title = formData.get("roomTitle");
    const description = formData.get("roomDescription");
    const username = formData.get('username') ?? "";
    
    sessionStorage.setItem('anochat-username', JSON.stringify(username));
    
    console.log("Creating room with:", { title, description });

    // You can send this to your server here:
    // await fetch("/api/rooms", { method: "POST", body: JSON.stringify({ title, description }) });

    setIsModalShowing(false);
    const roomId = uuidv4();
    navigate(`chat/${roomId}`);
  }

  return (
    <>
      {isModalShowing && (
        <div
          className="flex justify-center items-center text-black
          fixed inset-0 w-full h-full backdrop-brightness-50 z-50"
        >
          {/* CARD */}
          <div className="bg-white flex flex-col gap-2 w-[50%] h-[50%]">
            {/* CARD HEADER */}
            <div className="flex w-full justify-end p-2 pr-8">
              <span
                className="text-3xl font-bold cursor-pointer text-red-700"
                onClick={() => setIsModalShowing(false)}
              >
                X
              </span>
            </div>

            {/* CARD BODY */}
            <form className="flex flex-col gap-5" onSubmit={handleRoomCreation}>
              <div className="flex gap-2 w-full p-6">
                <label htmlFor="username" className="text-xl w-1/4">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="border-black outline-1 p-2 w-full"
                />
              </div>
              <div className="flex gap-2 w-full p-6">
                <label htmlFor="roomTitle" className="text-xl w-1/4">
                  Title
                </label>
                <input
                  type="text"
                  id="roomTitle"
                  name="roomTitle"
                  className="border-black outline-1 p-2 w-full"
                />
              </div>

              <div className="flex gap-2 w-full p-6">
                <label htmlFor="roomDescription" className="text-xl w-1/4">
                  Description
                </label>
                <input
                  type="text"
                  id="roomDescription"
                  name="roomDescription"
                  className="border-black outline-1 p-2 w-full"
                />
              </div>

              <div className="flex justify-end pr-5">
                <button
                  className="bg-black text-white w-fit p-2 rounded-sm cursor-pointer"
                  type="submit"
                >
                  <p>Submit</p>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateRoomModals;
