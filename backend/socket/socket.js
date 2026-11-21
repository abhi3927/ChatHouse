import { Server } from "socket.io";
import jwt from "jsonwebtoken";

// Set by initSocket(); controllers reach it only through the helpers below.
let io = null;

// userId -> Set(socketId). Used ONLY to track who is online.
// Messages are delivered through per-user rooms, never through socket ids.
const userSocketMap = new Map();

// Reads one cookie value from a raw "Cookie" header string.
const getCookie = (header, name) => {
  if (!header) return null;
  for (const part of header.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;
    if (part.slice(0, separatorIndex).trim() === name) {
      return decodeURIComponent(part.slice(separatorIndex + 1).trim());
    }
  }
  return null;
};

// Sends an event to every tab/device of one user (their personal room).
export const emitToUser = (userId, event, payload) => {
  if (io) io.to(String(userId)).emit(event, payload);
};

// Sends an event to every connected client.
export const emitToAll = (event, payload) => {
  if (io) io.emit(event, payload);
};

const broadcastOnlineUsers = () => {
  emitToAll("getOnlineUsers", [...userSocketMap.keys()]);
};

export const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true },
  });

  // Authenticate from the httpOnly "token" cookie. A client-sent userId is never trusted.
  io.use((socket, next) => {
    try {
      const token = getCookie(socket.handshake.headers.cookie, "token");
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.userId = String(decoded.userId);
      next();
    } catch (error) {
      next(new Error("Invalid or expired session"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    // One personal room per user: all of their tabs/devices join it.
    socket.join(userId);

    if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
    userSocketMap.get(userId).add(socket.id);
    broadcastOnlineUsers();

    // Typing events are forwarded to the receiver's room.
    socket.on("typing", (data) => {
      if (typeof data?.to === "string") {
        emitToUser(data.to, "typing", { from: userId });
      }
    });

    socket.on("stopTyping", (data) => {
      if (typeof data?.to === "string") {
        emitToUser(data.to, "stopTyping", { from: userId });
      }
    });

    socket.on("disconnect", () => {
      const sockets = userSocketMap.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        // The user is offline only when their last tab/device is gone.
        if (sockets.size === 0) userSocketMap.delete(userId);
      }
      broadcastOnlineUsers();
    });
  });

  return io;
};
