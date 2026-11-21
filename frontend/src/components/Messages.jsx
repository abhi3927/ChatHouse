import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Message from "./Message";

const Messages = () => {
  const messages = useSelector((state) => state.message.messages);
  const containerRef = useRef(null);
  const previousLength = useRef(0);

  // Always show the latest message: jump when a chat loads, glide for new messages.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: previousLength.current === 0 ? "auto" : "smooth",
    });
    previousLength.current = messages.length;
  }, [messages.length]);

  return (
    <div
      ref={containerRef}
      className="chat-bg flex-1 overflow-y-auto bg-wa-chat px-3 py-4 dark:bg-wa-chatDark sm:px-6"
    >
      <div className="flex flex-col gap-1.5">
        {messages.map((message) => (
          <Message key={message._id} message={message} />
        ))}
      </div>
    </div>
  );
};

export default Messages;
