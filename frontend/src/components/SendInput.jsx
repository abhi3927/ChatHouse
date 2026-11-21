import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector, useStore } from "react-redux";
import { FiSend } from "react-icons/fi";
import { BASE_URL } from "../index";
import { addMessage } from "../redux/messageSlice";
import { updateUserLastMessage } from "../redux/userSlice";

const TYPING_STOP_DELAY_MS = 1500;

// Rendered with key={selectedUser._id}, so it always belongs to one chat.
const SendInput = () => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const dispatch = useDispatch();
  const store = useStore();
  const socket = useSelector((state) => state.socket.socket);
  const selectedId = useSelector((state) => state.user.selectedUser?._id);

  const typingTimer = useRef(null);
  const isTyping = useRef(false);

  // Tells the other user we stopped typing (only if we had announced typing).
  const stopTyping = useCallback(() => {
    clearTimeout(typingTimer.current);
    if (isTyping.current && socket && selectedId) {
      socket.emit("stopTyping", { to: selectedId });
    }
    isTyping.current = false;
  }, [socket, selectedId]);

  // Also stops the indicator when leaving the chat.
  useEffect(() => stopTyping, [stopTyping]);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (!value.trim()) {
      stopTyping();
      return;
    }
    if (!socket || !selectedId) return;

    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit("typing", { to: selectedId });
    }
    // Debounced stop: fires after ~1.5s without keystrokes.
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, TYPING_STOP_DELAY_MS);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = text.trim();
    if (!message || sending || !selectedId) return;

    stopTyping();
    setText("");
    setSending(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/message/send/${selectedId}`,
        { message },
        { withCredentials: true }
      );
      const { newMessage } = res.data;

      // Only append to the open chat if the user did not switch chats meanwhile.
      if (store.getState().user.selectedUser?._id === selectedId) {
        dispatch(addMessage(newMessage));
      }
      dispatch(
        updateUserLastMessage({ userId: selectedId, message: newMessage, unreadDelta: 0 })
      );
    } catch (error) {
      setText(message);
      toast.error(error.response?.data?.message || "Message could not be sent");
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-gray-100 px-3 py-3 dark:bg-wa-panelDark"
    >
      <input
        type="text"
        value={text}
        onChange={handleChange}
        maxLength={2000}
        placeholder="Type a message"
        aria-label="Type a message"
        className="input-field flex-1 rounded-full py-2.5"
      />
      <button
        type="submit"
        disabled={!text.trim() || sending}
        aria-label="Send message"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wa-green text-lg text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiSend />
      </button>
    </form>
  );
};

export default SendInput;
