import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { addMessage } from "../redux/messageSlice";
import {
  addOtherUser,
  setTyping,
  updateUserLastMessage,
} from "../redux/userSlice";
import { fetchOtherUsers } from "./useGetOtherUsers";
import { markMessagesRead } from "./useGetMessages";

// Registers the real-time listeners (new message, new user, typing indicators).
const useGetRealTimeMessage = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const socket = useSelector((state) => state.socket.socket);

  useEffect(() => {
    if (!socket) return;

    // Handlers read the latest state from the store, so they never use stale values.
    const handleNewMessage = (message) => {
      const senderId = String(message.senderId);
      const { otherUsers, selectedUser } = store.getState().user;

      dispatch(setTyping({ userId: senderId, typing: false }));

      // Unknown sender (e.g. brand-new user's first message): reload the list,
      // which already contains this message as lastMessage + unread badge.
      if (!otherUsers.some((user) => user._id === senderId)) {
        fetchOtherUsers(dispatch);
        return;
      }

      const isChatOpen = selectedUser?._id === senderId;
      dispatch(
        updateUserLastMessage({
          userId: senderId,
          message,
          unreadDelta: isChatOpen ? 0 : 1,
        })
      );

      if (isChatOpen) {
        dispatch(addMessage(message));
        markMessagesRead(senderId);
      }
    };

    const handleNewUser = (user) => {
      dispatch(addOtherUser({ ...user, lastMessage: null, unreadCount: 0 }));
    };

    const handleTyping = ({ from }) => {
      dispatch(setTyping({ userId: from, typing: true }));
    };

    const handleStopTyping = ({ from }) => {
      dispatch(setTyping({ userId: from, typing: false }));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("newUser", handleNewUser);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("newUser", handleNewUser);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, dispatch, store]);
};

export default useGetRealTimeMessage;
