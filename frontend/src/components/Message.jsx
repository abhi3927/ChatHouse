import { useSelector } from "react-redux";

const Message = ({ message }) => {
  const authUserId = useSelector((state) => state.user.authUser?._id);
  const isMine = message.senderId === authUserId;

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-1.5 text-gray-900 shadow-sm dark:text-gray-100 sm:max-w-[65%] ${
          isMine
            ? "rounded-tr-none bg-wa-sentLight dark:bg-wa-sentDark"
            : "rounded-tl-none bg-white dark:bg-wa-recvDark"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>
        <p className="mt-0.5 text-right text-[11px] text-gray-500 dark:text-gray-300">{time}</p>
      </div>
    </div>
  );
};

export default Message;
