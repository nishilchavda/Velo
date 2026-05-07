const connection = require("../Models/connection.model");
const movement = require("../Models/movement.model");
const notificationService = require("./notification.service");

// send connection request
module.exports.sendRequest = async ({ senderId, receiverId, movementId }) => {
  if (senderId.toString() === receiverId.toString()) {
    throw new Error("You cannot send a request to yourself!");
  }

  const connectionExists = await connection.findOne({ senderId, receiverId });
  if (connectionExists) {
    throw new Error("A connection request already exists between you!");
  }

  const conn = new connection({ senderId, receiverId, movementId });
  await conn.save();

  await notificationService.createNotification({
    recipientId: receiverId,
    senderId,
    type: "connection_request",
    movementId
  });

  return conn;
};

// pending requests
module.exports.pendingRequests = async ({receiverId}) => {
    return await connection.find({
        receiverId: receiverId,
        status: "pending",
        $expr: { $ne: ["$senderId", "$receiverId"] }
    }).populate("senderId receiverId", "username profileImage");
}

// show update status (Accept/Reject/Pending)
module.exports.updateStatus = async ({ connectionId, userId, newStatus }) => {

  const checkExists = await connection.findById(connectionId);
  if (!checkExists) throw new Error("Connection ID does not exist.");

  const conn = await connection.findOneAndUpdate(
    { _id: connectionId, receiverId: userId },
    { status: newStatus },
    {returnDocument: 'after'}
  );

  if (!conn) {
    throw  new Error("Connection not found");
  }

  if (newStatus === "accepted") {
    // Notify the sender that it was accepted
    await notificationService.createNotification({
      recipientId: conn.senderId,
      senderId: userId,
      type: "connection_accept"
    });

    // Update the receiver's own "request" notification to "accept" so the button disappears
    const Notification = require("../Models/notification.model");
    await Notification.findOneAndUpdate(
        { recipientId: userId, senderId: conn.senderId, type: "connection_request" },
        { type: "connection_accept" }
    );
  }

  return conn;
};

// get my connections
module.exports.getMyConnections = async ({userId}) =>{
    return await connection.find({
        $or: [{senderId: userId}, {receiverId: userId}],
        status: "accepted",
        $expr: { $ne: ["$senderId", "$receiverId"] }
    }).sort({ createdAt: 1 }).populate("senderId receiverId", "username profileImage");
}

module.exports.getAllNotifications = async ({userId}) => {
    return await connection.find({
        $or: [{senderId: userId}, {receiverId: userId}],
        $expr: { $ne: ["$senderId", "$receiverId"] }
    })
    .sort({ updatedAt: -1 })
    .populate("senderId receiverId", "username profileImage")
    .populate("movementId");
}

module.exports.getBuddyCount = async ({ userId }) => {
    return await connection.countDocuments({
        $or: [{ senderId: userId }, { receiverId: userId }],
        status: "accepted",
        $expr: { $ne: ["$senderId", "$receiverId"] }
    });
};

module.exports.removeConnection = async ({ userId, targetUserId }) => {
    return await connection.findOneAndDelete({
        $or: [
            { senderId: userId, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: userId }
        ]
    });
};

module.exports.getUserBuddies = async ({ userId }) => {
    return await connection.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
        status: "accepted",
        $expr: { $ne: ["$senderId", "$receiverId"] }
    }).populate("senderId receiverId", "username profileImage fullname");
};