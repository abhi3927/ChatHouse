import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/userSlice";
import Avatar from "./Avatar";

// Time today, "Yesterday", or a short date for older messages.
const formatListTime = (value) => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "2-digit" });
};

const OtherUser = ({ user }) => {
  const dispatch = useDispatch();
  const authUserId = useSelector((state) => state.user.authUser?._id);
  const isSelected = useSelector((state) => state.user.selectedUser?._id === user._id);
  const isOnline = useSelector((state) => state.user.onlineUsers.includes(user._id));
  const isTyping = useSelector((state) => Boolean(state.user.typingUsers[user._id]));

  const { lastMessage, unreadCount } = user;

  let preview = `@${user.username}`;
  if (lastMessage) {
    const prefix = lastMessage.senderId === authUserId ? "You: " : "";
    preview = `${prefix}${lastMessage.message}`;
  }

  return (
    <button
      type="button"
      onClick={() => dispatch(setSelectedUser(user))}
      className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-wa-panelDark ${
        isSelected ? "bg-gray-100 dark:bg-wa-panelDark" : ""
      }`}
    >
      <div className="relative">
        <Avatar name={user.fullName} size="lg" />
        {isOnline && (
          <span
            className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-wa-green dark:border-wa-surfaceDark"
            aria-label="Online"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-medium">{user.fullName}</span>
          {lastMessage && (
            <span
              className={`shrink-0 text-xs ${
                unreadCount > 0 ? "font-semibold text-wa-green" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {formatListTime(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          {isTyping ? (
            <span className="truncate text-sm font-medium text-wa-green">typing...</span>
          ) : (
            <span className="truncate text-sm text-gray-500 dark:text-gray-400">{preview}</span>
          )}
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-wa-green px-1.5 text-xs font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default OtherUser;
