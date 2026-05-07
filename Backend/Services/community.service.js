const mongoose = require("mongoose");
const Community = require("../Models/community.model");
const Post = require("../Models/post.model");
const Comment = require("../Models/comment.model");
const CommunityMessage = require("../Models/communityMessage.model");
const notificationService = require("./notification.service");

module.exports.getAllCommunities = async () => {
    return await Community.find({ isPublic: true }).populate("creatorId", "username profileImage");
};

module.exports.getUserCommunities = async ({ userId }) => {
    return await Community.find({ members: userId }).populate("creatorId", "username profileImage");
};

module.exports.getCommunityById = async ({ communityId }) => {
    return await Community.findById(communityId).populate("creatorId", "username profileImage").populate("members", "username profileImage");
};

module.exports.createCommunity = async ({ userId, name, description, bannerImage, profileImage }) => {
    const community = new Community({
        name,
        description,
        bannerImage,
        profileImage,
        creatorId: userId,
        members: [userId]
    });
    return await community.save();
};

module.exports.updateCommunity = async ({ userId, communityId, name, description, bannerImage, profileImage }) => {
    const community = await Community.findOne({ _id: communityId, creatorId: userId });
    if (!community) throw new Error("Community not found or unauthorized");
    
    if (name) community.name = name;
    if (description) community.description = description;
    if (bannerImage) community.bannerImage = bannerImage;
    if (profileImage) community.profileImage = profileImage;
    
    return await community.save();
};

module.exports.deleteCommunity = async ({ userId, communityId }) => {
    const community = await Community.findOne({ _id: communityId, creatorId: userId });
    if (!community) throw new Error("Community not found or unauthorized");
    
    const posts = await Post.find({ communityIds: communityId });
    const postIds = posts.map(p => p._id);
    
    await Comment.deleteMany({ postId: { $in: postIds } });
    
    // Instead of deleting the post, we remove this community from the post's communityIds
    // If communityIds becomes empty, we could delete the post.
    await Post.updateMany(
        { communityIds: communityId },
        { $pull: { communityIds: communityId } }
    );
    // Delete posts that have no community left
    await Post.deleteMany({ communityIds: { $size: 0 } });

    await CommunityMessage.deleteMany({ communityId });
    await Community.findByIdAndDelete(communityId);
    
    return community;
};

module.exports.joinCommunity = async ({ userId, communityId }) => {
    return await Community.findByIdAndUpdate(
        communityId,
        { $addToSet: { members: userId } },
        { returnDocument: 'after' }
    );
};

module.exports.leaveCommunity = async ({ userId, communityId }) => {
    return await Community.findByIdAndUpdate(
        communityId,
        { $pull: { members: userId } },
        { returnDocument: 'after' }
    );
};


module.exports.getCommunityPosts = async ({ communityId }) => {
    const posts = await Post.find({ communityIds: communityId })
        .sort({ createdAt: -1 })
        .populate("userId", "username profileImage")
        .populate("communityIds", "name profileImage")
        .lean();
    
    for (let post of posts) {
        post.commentCount = await Comment.countDocuments({ postId: post._id });
    }
    return posts;
};

module.exports.getUserPosts = async ({ userId }) => {
    const posts = await Post.find({ userId })
        .sort({ createdAt: -1 })
        .populate("userId", "username profileImage")
        .populate("communityIds", "name profileImage")
        .lean();

    for (let post of posts) {
        post.commentCount = await Comment.countDocuments({ postId: post._id });
    }
    return posts;
};

module.exports.getAllPosts = async () => {
    const posts = await Post.find()
        .sort({ createdAt: -1 })
        .populate("userId", "username profileImage")
        .populate("communityIds", "name profileImage")
        .lean();

    for (let post of posts) {
        post.commentCount = await Comment.countDocuments({ postId: post._id });
    }
    return posts;
};

module.exports.createPost = async ({ userId, communityId, content, image, video }) => {
    const ids = Array.isArray(communityId) ? communityId : [communityId];
    const post = new Post({ userId, communityIds: ids, content, image, video });
    await post.save();
    return await post.populate([
        { path: "userId", select: "username profileImage" },
        { path: "communityIds", select: "name profileImage" }
    ]);
};

module.exports.updatePost = async ({ userId, postId, content, image, video }) => {
    const post = await Post.findOne({ _id: postId, userId });
    if (!post) throw new Error("Post not found or unauthorized");
    
    post.content = content;
    if (image !== undefined) post.image = image;
    if (video !== undefined) post.video = video;
    
    await post.save();
    return await post.populate("userId", "username profileImage");
};

module.exports.deletePost = async ({ userId, postId }) => {
    const post = await Post.findOneAndDelete({ _id: postId, userId });
    if (!post) throw new Error("Post not found or unauthorized");
    
    await Comment.deleteMany({ postId });
    return post;
};

module.exports.likePost = async ({ userId, postId }) => {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");
    
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
        post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
        post.likes.push(userId);
    }
    await post.save();
    
    if (!isLiked) {
        await notificationService.createNotification({
            recipientId: post.userId,
            senderId: userId,
            type: "like_post",
            postId: post._id
        });
    }

    const result = post.toObject();
    result.commentCount = await Comment.countDocuments({ postId });
    return result;
};

module.exports.addComment = async ({ userId, postId, content, parentId = null }) => {
    const comment = new Comment({ userId, postId, content, parentId });
    await comment.save();
    
    // Notify post owner
    const post = await Post.findById(postId);
    if (post) {
        await notificationService.createNotification({
            recipientId: post.userId,
            senderId: userId,
            type: "comment_post",
            postId: post._id,
            commentId: comment._id
        });
    }

    // Notify parent comment owner if reply
    if (parentId) {
        const parentComment = await Comment.findById(parentId);
        if (parentComment) {
            await notificationService.createNotification({
                recipientId: parentComment.userId,
                senderId: userId,
                type: "reply_comment",
                postId: postId,
                commentId: comment._id
            });
        }
    }

    return await comment.populate("userId", "username profileImage");
};

module.exports.getPostComments = async ({ postId }) => {
    return await Comment.find({ postId })
        .sort({ createdAt: 1 })
        .populate("userId", "username profileImage");
};

module.exports.likeComment = async ({ userId, commentId }) => {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    const isLiked = comment.likes.includes(userId);
    if (isLiked) {
        comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    } else {
        comment.likes.push(userId);
    }
    await comment.save();

    if (!isLiked) {
        await notificationService.createNotification({
            recipientId: comment.userId,
            senderId: userId,
            type: "like_comment",
            postId: comment.postId,
            commentId: comment._id
        });
    }

    return comment;
};

module.exports.getCommunityMessages = async ({ communityId }) => {
    return await CommunityMessage.find({ communityId })
        .sort({ createdAt: 1 })
        .populate("senderId", "username profileImage");
};

module.exports.createMessage = async ({ communityId, senderId, content }) => {
    const message = new CommunityMessage({ communityId, senderId, content });
    await message.save();
    return await message.populate("senderId", "username profileImage");
};
