import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import ThemeButton from "../inputs/ThemeButton";
import ThemeInput from "../inputs/ThemeInput";
import Modal from "./Modal";
import { setStorageUsername } from "@/utils/fx/sessionStorage";

const ChatRoomUsernameEntryModal = ({
  username,
  setUsername,
}: {
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
}) => {
  // States
  const [isShowing, setIsShowing] = useState(!username);
  // Lifecycle

  // Functions
  function handleUsernameUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formUsername = formData.get("username");
    console.log("updated username", formUsername);
    if (formUsername == "" || !formUsername) return;

    setUsername(String(formUsername));
    setIsShowing(false);
    setStorageUsername(String(formUsername));
    console.log("updated username");
  };
  
  return (
    <>
      <Modal isOpen={isShowing} type={"input"} title="Enter Username">
        <form className="space-y-6" onSubmit={(e) => handleUsernameUpdate(e)}>
          <ThemeInput
            labelName={"username"}
            inputFor={"username"}
            isRequired={true}
          />
          <div className="flex justify-end w-full p-4">
            <ThemeButton text="submit" type="submit" />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ChatRoomUsernameEntryModal;
