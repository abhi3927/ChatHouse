import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import { Message } from "../models/messageModel.js";
import { emitToAll } from "../socket/socket.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Cookie flags: lax + insecure for localhost, none + secure for production (HTTPS).
const cookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  };
};

const serverError = (res, action, error) => {
  console.error(`${action} failed:`, error.message);
  return res.status(500).json({ message: "Internal server error" });
};

export const register = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword } = req.body || {};

    const fields = [fullName, username, password, confirmPassword];
    if (!fields.every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_.]{3,20}$/.test(cleanUsername)) {
      return res.status(400).json({
        message:
          "Username must be 3-20 characters: letters, numbers, dot or underscore",
      });
    }

    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName: fullName.trim(),
      username: cleanUsername,
      password: hashedPassword,
    });

    // Let every online user add the new account to their sidebar without a refresh.
    emitToAll("newUser", {
      _id: String(user._id),
      fullName: user.fullName,
      username: user.username,
      createdAt: user.createdAt,
    });

    return res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    // Two simultaneous signups with the same username hit the unique index.
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username already taken" });
    }
    return serverError(res, "Register", error);
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });
    const passwordMatches = user && (await bcrypt.compare(password, user.password));
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: String(user._id) },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res
      .status(200)
      .cookie("token", token, { ...cookieOptions(), maxAge: ONE_DAY_MS })
      .json({
        message: `Welcome back, ${user.fullName}`,
        user: {
          _id: String(user._id),
          fullName: user.fullName,
          username: user.username,
        },
      });
  } catch (error) {
    return serverError(res, "Login", error);
  }
};

export const logout = (req, res) => {
  try {
    // clearCookie must use the same flags the cookie was set with.
    return res
      .status(200)
      .clearCookie("token", cookieOptions())
      .json({ message: "Logged out successfully" });
  } catch (error) {
    return serverError(res, "Logout", error);
  }
};

// Used by the frontend on app load to restore the session from the cookie.
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return serverError(res, "Get current user", error);
  }
};

// All other users + lastMessage + unreadCount, newest conversation first.
export const getOtherUsers = async (req, res) => {
  try {
    const me = new mongoose.Types.ObjectId(req.userId);

    const [users, lastMessages, unreadCounts] = await Promise.all([
      User.find({ _id: { $ne: me } }).select("-password").lean(),
      // Latest message of every conversation involving me, keyed by the other user.
      Message.aggregate([
        { $match: { $or: [{ senderId: me }, { receiverId: me }] } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: {
              $cond: [{ $eq: ["$senderId", me] }, "$receiverId", "$senderId"],
            },
            lastMessage: { $first: "$$ROOT" },
          },
        },
      ]),
      // Unread messages sent to me, grouped by sender.
      Message.aggregate([
        { $match: { receiverId: me, read: false } },
        { $group: { _id: "$senderId", count: { $sum: 1 } } },
      ]),
    ]);

    const lastMessageByUser = new Map(
      lastMessages.map((entry) => [String(entry._id), entry.lastMessage])
    );
    const unreadByUser = new Map(
      unreadCounts.map((entry) => [String(entry._id), entry.count])
    );

    const result = users.map((user) => {
      const id = String(user._id);
      const last = lastMessageByUser.get(id);
      return {
        ...user,
        lastMessage: last
          ? {
              message: last.message,
              createdAt: last.createdAt,
              senderId: last.senderId,
            }
          : null,
        unreadCount: unreadByUser.get(id) || 0,
      };
    });

    // Chats first (latest message first), then users without a chat A-Z.
    result.sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
      }
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      return a.fullName.localeCompare(b.fullName);
    });

    return res.status(200).json(result);
  } catch (error) {
    return serverError(res, "Get users", error);
  }
};
