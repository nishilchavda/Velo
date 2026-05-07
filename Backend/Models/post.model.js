const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    communityIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
        required: true,
    }],
    content: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "",
    },
    video: {
        type: String,
        default: "",
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
