const socketIo = require("socket.io");
const chatService = require("./Services/chat.service");
const communityService = require("./Services/community.service");

let io;

const init = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : "http://localhost:5173",
      credentials: true,
    },
  });


  io.on("connection", (socket) => {
    // Join a specific connection room (Personal)
    socket.on("join_chat", (connectionId) => {
      socket.join(connectionId);
    });

    // Join a community room (Group Chat)
    socket.on("join_community", (communityId) => {
      socket.join(`comm_${communityId}`);
    });

    // Join personal user room for notifications
    socket.on("join_user", (userId) => {
      socket.join(`user_${userId}`);
    });

    // Handle sending personal message
    socket.on("send_message", async (data) => {
      const { connectionId, senderId, content } = data;
      try {
        const savedMsg = await chatService.sendMessage({
          senderId,
          connectionId,
          content,
        });
        io.to(connectionId).emit("receive_message", savedMsg);
      } catch (err) {
        console.error("❌ Error sending message via socket:", err.message);
      }
    });

    // Handle sending community message
    socket.on("send_community_message", async (data) => {
      const { communityId, senderId, content } = data;
      try {
        const savedMsg = await communityService.createMessage({
          communityId,
          senderId,
          content,
        });
        io.to(`comm_${communityId}`).emit("receive_community_message", savedMsg);
      } catch (err) {
        console.error("❌ Error sending community message via socket:", err.message);
      }
    });

    socket.on("disconnect", () => {
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { init, getIo };
