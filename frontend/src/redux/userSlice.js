import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authUser: null,
  // true until the first GET /user/me call has finished
  authLoading: true,
  otherUsers: [],
  selectedUser: null,
  // array of online user ids
  onlineUsers: [],
  // { [userId]: true } for users who are typing to me right now
  typingUsers: {},
};

// Users with a chat first (latest message first), the rest alphabetically.
const sortUsers = (users) =>
  [...users].sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : null;
    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : null;
    if (aTime !== null && bTime !== null) return bTime - aTime;
    if (aTime !== null) return -1;
    if (bTime !== null) return 1;
    return a.fullName.localeCompare(b.fullName);
  });

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      state.authUser = action.payload;
      state.authLoading = false;
    },
    setOtherUsers: (state, action) => {
      state.otherUsers = sortUsers(action.payload);
    },
    // Adds a user (e.g. a newly registered one) unless it is already listed.
    addOtherUser: (state, action) => {
      const exists = state.otherUsers.some((user) => user._id === action.payload._id);
      if (!exists) {
        state.otherUsers = sortUsers([...state.otherUsers, action.payload]);
      }
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
      // Drop typing flags of users that just went offline.
      for (const userId of Object.keys(state.typingUsers)) {
        if (!action.payload.includes(userId)) delete state.typingUsers[userId];
      }
    },
    // Updates the sidebar preview of one user. unreadDelta is 1 for an incoming
    // message in a chat that is not open, otherwise 0.
    updateUserLastMessage: (state, action) => {
      const { userId, message, unreadDelta = 0 } = action.payload;
      const user = state.otherUsers.find((item) => item._id === userId);
      if (!user) return;
      user.lastMessage = {
        message: message.message,
        createdAt: message.createdAt,
        senderId: message.senderId,
      };
      user.unreadCount += unreadDelta;
      state.otherUsers = sortUsers(state.otherUsers);
    },
    clearUnread: (state, action) => {
      const user = state.otherUsers.find((item) => item._id === action.payload);
      if (user) user.unreadCount = 0;
    },
    setTyping: (state, action) => {
      const { userId, typing } = action.payload;
      if (typing) state.typingUsers[userId] = true;
      else delete state.typingUsers[userId];
    },
    // Back to a clean logged-out state (the auth check has already finished).
    resetUser: () => ({ ...initialState, authLoading: false }),
  },
});

export const {
  setAuthUser,
  setOtherUsers,
  addOtherUser,
  setSelectedUser,
  setOnlineUsers,
  updateUserLastMessage,
  clearUnread,
  setTyping,
  resetUser,
} = userSlice.actions;
export default userSlice.reducer;
