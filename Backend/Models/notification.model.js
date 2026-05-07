const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["like_post", "comment_post", "reply_comment", "like_comment", "connection_request", "connection_accept"],
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },
    movementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movement"
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
