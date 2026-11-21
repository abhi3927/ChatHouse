import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BASE_URL } from "../index";
import { setMessages } from "../redux/messageSlice";
import { clearUnread } from "../redux/userSlice";

// Tells the server that all messages from this user have been read.
export const markMessagesRead = async (senderId) => {
  try {
    await axios.put(
      `${BASE_URL}/api/v1/message/read/${senderId}`,
      {},
      { withCredentials: true }
    );
  } catch (error) {
    // Not critical: the unread count is corrected on the next user-list load.
  }
};

// Loads the conversation of the selected user, marks it as read and clears its badge.
const useGetMessages = () => {
  const dispatch = useDispatch();
  const selectedId = useSelector((state) => state.user.selectedUser?._id);

  useEffect(() => {
    // Never show the previous chat's messages while the new one loads.
    dispatch(setMessages([]));
    if (!selectedId) return;

    let cancelled = false;

    const loadMessages = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/message/${selectedId}`, {
          withCredentials: true,
        });
        if (!cancelled) dispatch(setMessages(res.data));
      } catch (error) {
        if (!cancelled) {
          toast.error(error.response?.data?.message || "Could not load messages");
        }
      }
    };

    loadMessages();
    markMessagesRead(selectedId);
    dispatch(clearUnread(selectedId));

    return () => {
      cancelled = true;
    };
  }, [selectedId, dispatch]);
};

export default useGetMessages;
