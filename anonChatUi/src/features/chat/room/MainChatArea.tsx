import { emojis } from "@/utils/constants/globals";
import { motion, AnimatePresence } from "framer-motion";
import { RefObject, useState } from "react";
import { FaSmileWink } from "react-icons/fa";

// Mock types for the component
type RoomData = {
  isPublic: boolean;
};

type SocketMsgObject = {
  username: string;
  userColor: string;
  textColor?: string;
  time: string;
  data: string;
};

type Props = {
  roomData: RoomData;
  messages: SocketMsgObject[];
  username: string;
  MAX_MSG: number;
  maximumMsgShown: number;
  setMaximumMsgShown: React.Dispatch<React.SetStateAction<number>>;
  sendMessage: (e: React.FormEvent) => void;
  inputRef: RefObject<HTMLInputElement>;
  messageBoxRef: RefObject<HTMLDivElement>;
  isMobileAndShowRoomDetails: boolean;
};

const MainChatArea = ({
  roomData = { isPublic: true },
  messages = [],
  username = "user123",
  MAX_MSG = 50,
  maximumMsgShown = 50,
  setMaximumMsgShown = () => {},
  sendMessage = () => {},
  inputRef,
  messageBoxRef,
  isMobileAndShowRoomDetails = false,
}: Props) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentEmojiPage, setCurrentEmojiPage] = useState(0);
  
  const emojisPerPage = 16;
  const totalPages = Math.ceil(emojis.length / emojisPerPage);
  const currentPageEmojis = emojis.slice(
    currentEmojiPage * emojisPerPage,
    (currentEmojiPage + 1) * emojisPerPage
  );

  const nextEmojiPage = () => {
    setCurrentEmojiPage((prev) => (prev + 1) % totalPages);
  };

  const prevEmojiPage = () => {
    setCurrentEmojiPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const messageSliceStartPointer =
    messages.length - maximumMsgShown > 0 ? messages.length - maximumMsgShown : 0;

  const handleEmojiSelect = (emoji: string) => {
    if (inputRef && inputRef.current) {
      const input = inputRef.current;
      const cursorPosition = input.selectionStart || 0;
      const currentValue = input.value;
      
      // Insert emoji at cursor position
      const newValue = 
        currentValue.slice(0, cursorPosition) + 
        emoji + 
        currentValue.slice(cursorPosition);
      
      input.value = newValue;
      
      // Set cursor position after the emoji
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(cursorPosition + emoji.length, cursorPosition + emoji.length);
      }, 0);
    }
    // Don't close the picker - let user add multiple emojis
  };

  return (
    <motion.section
      className={`h-7/10 md:h-full md:flex-1 flex flex-col bg-gray-900/20 border border-red-900/20 ${
        isMobileAndShowRoomDetails && "h-full"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Header */}
      <div className="hidden md:flex flex-col items-center justify-between w-full p-4 border-b border-red-900/30 bg-black/20">
        <div className="flex items-center gap-3">
          <span className="text-orange-400 text-lg font-mono">
            {roomData.isPublic ? "[PUBLIC]" : "[SECURE]"}
          </span>
          <div>
            <h2 className="text-white font-bold uppercase font-mono">
              ANONYMOUS_CHANNEL
            </h2>
            <p className="text-gray-400 text-xs font-mono">
              End-to-end encrypted • {messages.length} messages
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs uppercase font-mono">
            CONNECTED
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-8/10 overflow-y-auto p-4 space-y-4 safe-scroll" ref={messageBoxRef}>
        {messages.length > MAX_MSG && (
          <div
            role="button"
            className="flex justify-center underline cursor-pointer text-muted hover:text-orange-600"
            onClick={() => setMaximumMsgShown((prev) => prev + MAX_MSG)}
          >
            ...load more messages
          </div>
        )}
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <div className="text-4xl mb-4 font-mono">[ENCRYPTED]</div>
            <p className="font-mono">No messages in secure channel</p>
            <p className="text-sm text-gray-600 mt-2 font-mono">
              Start the conversation...
            </p>
          </div>
        ) : (
          messages.slice(messageSliceStartPointer).map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${
                msg.username === username ? "justify-end" : "justify-start"
              }`}
              initial={{ opacity: 0.1, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div
                className={`max-w-[70%] ${
                  msg.username === username ? "order-2" : "order-1"
                }`}
              >
                <div
                  className="p-3 border-l-4"
                  style={{
                    borderLeftColor: msg.userColor,
                    backgroundColor: msg.userColor,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-black/50 text-gray-300 font-mono">
                      {msg.username}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {msg.time}
                    </span>
                  </div>
                  <p
                    className="text-white text-sm break-words font-mono"
                    style={{ color: msg?.textColor }}
                  >
                    {msg?.data as string}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Input */}
      <motion.form
        onSubmit={sendMessage}
        className={`h-2/10 p-4 flex items-center border-t mt-auto border-red-900/30 bg-black/30 relative ${
          isMobileAndShowRoomDetails && "h-auto"
        }`}
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.05 }}
      >
        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              className="absolute bottom-full right-20 mb-2 bg-black/95 border border-red-900/30 rounded-lg p-2 backdrop-blur-sm z-50 w-52"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-400 font-mono text-xs uppercase">
                  [EMOJI] {currentEmojiPage + 1}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-red-400 hover:text-red-300 font-mono text-xs"
                >
                  [X]
                </button>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mb-2">
                <button
                  type="button"
                  onClick={prevEmojiPage}
                  className="text-orange-400 hover:text-orange-300 font-mono text-xs px-2 py-1 border border-red-900/30 hover:border-orange-500/50 rounded transition-colors"
                >
                  &lt;&lt;
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentEmojiPage(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentEmojiPage 
                          ? 'bg-orange-400' 
                          : 'bg-red-900/50 hover:bg-red-700/50'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={nextEmojiPage}
                  className="text-orange-400 hover:text-orange-300 font-mono text-xs px-2 py-1 border border-red-900/30 hover:border-orange-500/50 rounded transition-colors"
                >
                  &gt;&gt;
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {currentPageEmojis.map((emoji, index) => (
                  <button
                    key={currentEmojiPage * emojisPerPage + index}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className="text-sm hover:bg-orange-600/20 hover:border hover:border-orange-600/50 p-1 rounded transition-all duration-200 hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex w-full gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 text-sm font-mono z-10">
              &gt;
            </span>
            <input
              type="text"
              placeholder="Enter message..."
              className="w-full !pl-8 !pr-4 py-3 bg-black/50 border border-red-900/30 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 font-mono"
              ref={inputRef}
            />
          </div>
          {/* Emoji Button - Desktop Only */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`px-3 py-3 bg-black/50 border border-red-900/30 text-orange-400 hover:text-orange-300 hover:border-orange-500 transition-colors font-mono text-sm ${
              showEmojiPicker ? 'text-orange-300 border-orange-500' : ''
            }`}
            title="Open emoji picker"
          >
            <FaSmileWink />
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-orange-600 text-black font-bold uppercase text-sm hover:bg-orange-500 font-mono"
          >
            SEND
          </button>
        </div>
      </motion.form>
    </motion.section>
  );
};

export default MainChatArea;