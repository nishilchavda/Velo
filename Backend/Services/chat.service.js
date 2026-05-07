const chatModel = require("../Models/chat.model");
const connectionModel = require("../Models/connection.model");

// send message if that connection is accepted
module.exports.sendMessage = async ({
  senderId,
  receiverId,
  connectionId,
  content,
}) => {
  const connectionExists = await connectionModel.findById(connectionId);
  if (!connectionExists) {
    throw new Error("Connection does not exist!");
  }

  const chat = new chatModel({ connectionId, senderId, content });
  return await chat.save();
};

// get chat history
module.exports.getChatHistory = async (connectionId) => {
  const conn = await connectionModel.findById(connectionId);
  if (!conn) return [];

  // Find all connections between these two users (sender and receiver)
  // to provide a unified chat history across different movements/requests
  const allConnections = await connectionModel.find({
    $or: [
      { senderId: conn.senderId, receiverId: conn.receiverId },
      { senderId: conn.receiverId, receiverId: conn.senderId }
    ],
    status: "accepted"
  });

  const connectionIds = allConnections.map(c => c._id);

  return await chatModel
    .find({ connectionId: { $in: connectionIds } })
    .sort({ createdAt: 1 })
    .populate("senderId", "username profileImage");
};