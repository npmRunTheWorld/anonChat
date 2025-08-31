import RoomEntryCard from "./RoomEntryCard";

const ChatLounge = () => {
  //state

  //function

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-20">
        {Array.from({ length: 10 }).map(() => (
          <RoomEntryCard />
        ))}
      </div>
    </div>
  );
};

export default ChatLounge;
