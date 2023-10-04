const ProviderChatModel = require("../../models/providerChatModel");
const userModel = require("../../models/userModel");
const MessageModel = require("../../models/messageModel");

const providerInfo = async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await userModel.findById(providerId);
    res.status(200).json({ provider: provider });
  } catch (err) {
    console.log(err);
  }
};

const fetchChats = async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await ProviderChatModel.find({ users: { $elemMatch: { $eq: userId } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
    res.status(200).json({ results: results });

  } catch (err) {
    console.error("fetchChats", err);
  }
};

const accessChat = async (req, res) => {
  try {
    const { providerId } = req.params;
    const userId = req.payload.id;

    if (!userId) {
      return res
        .status(400)
        .json({ errmsg: "userId param not sent with request" });
    }

    const existingChat = await ProviderChatModel.findOne({
      users: { $all: [userId, providerId] },
    });

    if (existingChat) {
      const otherUserId = existingChat.users.find(user => user.toString() !== userId);
      const otherUser = await userModel.findById(otherUserId);
      const messages = await MessageModel.find({
        providerChat: existingChat._id,
      }).populate("sender", "-password");
      return res.status(200).json({ messages, chatId: existingChat._id, otherUser });
    }

    const chatData = {
      users: [userId, providerId],
    };

    const createdChat = await ProviderChatModel.create(chatData);

    if (createdChat) {
      res.status(200).json({ message: "Chat model created" });
    } else {
      res.status(500).json({ error: "Failed to create a new chat" });
    }
  } catch (err) {
    console.error("accessChat", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addMessage = async (req, res) => {
  try {
    const { userId, message, chatId } = req.body;
    const newMessage = await MessageModel.create({
      sender: userId,
      message,
      providerChat: chatId
    });
    if (newMessage) {
      await ProviderChatModel.findByIdAndUpdate(chatId, { $set: { latestmessage: newMessage._id } })
      res.status(200).json({ msg: newMessage, message: "message " });
    } else {
      res.status(403).json({ errmsg: "not ready" });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  providerInfo,
  fetchChats,
  accessChat,
  addMessage,
};
