const Notification = require("../Models/notification.model");

module.exports.createNotification = async ({ recipientId, senderId, type, postId, commentId, movementId }) => {
    // Avoid notifying yourself
    if (recipientId.toString() === senderId.toString()) return null;

    // Check for duplicate like notifications
    if (type === "like_post" || type === "like_comment") {
        const existing = await Notification.findOne({ recipientId, senderId, type, postId, commentId });
        if (existing) return existing;
    }

    const notification = new Notification({
        recipientId,
        senderId,
        type,
        postId,
        commentId,
        movementId
    });
    
    const saved = await notification.save();

    // Emit via socket for real-time update
    try {
        // Require socket only when needed to avoid circular dependency issues
        const socketModule = require("../socket");
        const io = socketModule.getIo();
        
        if (io) {
            const populated = await Notification.findById(saved._id)
                .populate("senderId", "username profileImage")
                .populate("postId", "content")
                .populate("commentId", "content")
                .populate({
                    path: "movementId",
                    select: "destination",
                    populate: { path: "destination.name" }
                });
                
            io.to(`user_${recipientId}`).emit("new_notification", populated);
        }
    } catch (err) {
        // Silently fail socket emit so it doesn't break the main request
        console.error("Socket notification emit failed:", err.message);
    }

    return saved;
};

module.exports.getUserNotifications = async ({ userId }) => {
    const notifications = await Notification.find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .populate("senderId", "username profileImage")
        .populate("postId", "content")
        .populate("commentId", "content")
        .populate("movementId")
        .limit(50);

    // Lazy reconcile connection requests to ensure UI is accurate
    const Connection = require("../Models/connection.model");
    const reconciled = await Promise.all(notifications.map(async (notif) => {
        if (notif.type === "connection_request") {
            const conn = await Connection.findOne({
                $or: [
                    { senderId: notif.senderId?._id, receiverId: userId },
                    { senderId: userId, receiverId: notif.senderId?._id }
                ]
            });
            
            if (conn && conn.status === "accepted") {
                notif.type = "connection_accept";
                // Update in background
                Notification.findByIdAndUpdate(notif._id, { type: "connection_accept" }).exec();
            }
        }
        return notif;
    }));

    return reconciled;
};

module.exports.markAsRead = async ({ userId, notificationId }) => {
    return await Notification.findOneAndUpdate(
        { _id: notificationId, recipientId: userId },
        { isRead: true },
        { returnDocument: 'after' }
    );
};

module.exports.markAllAsRead = async ({ userId }) => {
    return await Notification.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true }
    );
};

module.exports.getUnreadCount = async ({ userId }) => {
    return await Notification.countDocuments({ recipientId: userId, isRead: false });
};
