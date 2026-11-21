import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiMessageCircle } from "react-icons/fi";
import { setSelectedUser } from "../redux/userSlice";
import Avatar from "./Avatar";
import Messages from "./Messages";
import SendInput from "./SendInput";

const MessageContainer = () => {
  const dispatch = useDispatch();
  const selectedUser = useSelector((state) => state.user.selectedUser);
  const isOnline = useSelector((state) =>
    state.user.onlineUsers.includes(state.user.selectedUser?._id)
  );
  const isTyping = useSelector((state) =>
    Boolean(state.user.typingUsers[state.user.selectedUser?._id])
  );

  if (!selectedUser) {
    return (
      <div className="chat-bg flex h-full w-full flex-col items-center justify-center gap-4 bg-wa-chat px-6 text-center dark:bg-wa-chatDark">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-wa-green/15 text-4xl text-wa-teal dark:text-wa-green">
          <FiMessageCircle />
        </div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
          Welcome - Select a chat to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex items-center gap-3 bg-wa-teal px-3 py-3 text-white dark:bg-wa-panelDark">
        {/* Back button: mobile only, returns to the sidebar screen */}
        <button
          type="button"
          onClick={() => dispatch(setSelectedUser(null))}
          aria-label="Back to chats"
          className="rounded-full p-2 text-xl transition hover:bg-white/10 md:hidden"
        >
          <FiArrowLeft />
        </button>
        <Avatar name={selectedUser.fullName} size="md" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{selectedUser.fullName}</p>
          <p className="text-xs text-white/80">
            {isTyping ? "typing..." : isOnline ? "online" : "offline"}
          </p>
        </div>
      </header>

      <Messages />
      {/* key resets the input (and its typing state) when switching chats */}
      <SendInput key={selectedUser._id} />
    </div>
  );
};

export default MessageContainer;
