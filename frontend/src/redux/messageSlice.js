import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: { messages: [] },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload || [];
    },
    // Ignores duplicates (the same message can arrive via the API and the socket).
    addMessage: (state, action) => {
      const exists = state.messages.some(
        (message) => message._id === action.payload._id
      );
      if (!exists) state.messages.push(action.payload);
    },
  },
});

export const { setMessages, addMessage } = messageSlice.actions;
export default messageSlice.reducer;
