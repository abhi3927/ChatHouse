import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";
import { emitToUser } from "../socket/socket.js";

const MAX_MESSAGE_LENGTH = 2000;

const isValidId = (id) => typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

const serverError = (res, action, error) => {
  console.error(`${action} failed:`, error.message);
  return res.status(500).json({ message: "Internal server error" });
};

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const receiverId = req.params.id.toLowerCase();

    if (receiverId === senderId) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }

    const text = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!text) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        message: `Message cannot be longer than ${MAX_MESSAGE_LENGTH} characters`,
      });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the conversation on the first message between the two users.
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: text,
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    // Delivered to every tab/device of the receiver through their personal room.
    emitToUser(receiverId, "newMessage", newMessage);

    return res.status(201).json({ newMessage });
  } catch (error) {
    return serverError(res, "Send message", error);
  }
};

export const getMessages = async (req, res) => {
  try {
    const myId = req.userId;

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const otherId = req.params.id.toLowerCase();

    // Empty array when the two users have never chatted.
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json(messages);
  } catch (error) {
    return serverError(res, "Get messages", error);
  }
};

// Marks every message sent by :id to me as read.
export const markMessagesRead = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const result = await Message.updateMany(
      { senderId: req.params.id.toLowerCase(), receiverId: req.userId, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return serverError(res, "Mark messages read", error);
  }
};
