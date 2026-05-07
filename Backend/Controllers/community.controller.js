const communityService = require("../Services/community.service");

module.exports.getAllCommunities = async (req, res) => {
    try {
        const communities = await communityService.getAllCommunities();
        res.status(200).json({ communities });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getUserCommunities = async (req, res) => {
    try {
        const userId = req.userId;
        const communities = await communityService.getUserCommunities({ userId });
        res.status(200).json({ communities });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getCommunityDetail = async (req, res) => {
    try {
        const { communityId } = req.params;
        const community = await communityService.getCommunityById({ communityId });
        res.status(200).json({ community });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.createCommunity = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, description, bannerImage, profileImage } = req.body;
        const community = await communityService.createCommunity({ userId, name, description, bannerImage, profileImage });
        res.status(201).json({ message: "Community created successfully", community });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.updateCommunity = async (req, res) => {
    try {
        const userId = req.userId;
        const { communityId } = req.params;
        const { name, description, bannerImage, profileImage } = req.body;
        const community = await communityService.updateCommunity({ userId, communityId, name, description, bannerImage, profileImage });
        res.status(200).json({ message: "Community updated successfully", community });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.deleteCommunity = async (req, res) => {
    try {
        const userId = req.userId;
        const { communityId } = req.params;
        await communityService.deleteCommunity({ userId, communityId });
        res.status(200).json({ message: "Community deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.joinCommunity = async (req, res) => {
    try {
        const userId = req.userId;
        const { communityId } = req.params;
        await communityService.joinCommunity({ userId, communityId });
        res.status(200).json({ message: "Joined community successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.leaveCommunity = async (req, res) => {
    try {
        const userId = req.userId;
        const { communityId } = req.params;
        await communityService.leaveCommunity({ userId, communityId });
        res.status(200).json({ message: "Left community successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getCommunityPosts = async (req, res) => {
    try {
        const { communityId } = req.params;
        const posts = await communityService.getCommunityPosts({ communityId });
        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await communityService.getUserPosts({ userId });
        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getUserJoinedCommunities = async (req, res) => {
    try {
        const { userId } = req.params;
        const communities = await communityService.getUserCommunities({ userId });
        res.status(200).json({ communities });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getAllPosts = async (req, res) => {
    try {
        const posts = await communityService.getAllPosts();
        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.createPost = async (req, res) => {
    try {
        const userId = req.userId;
        const { communityId, content, image, video } = req.body;
        const post = await communityService.createPost({ userId, communityId, content, image, video });
        res.status(201).json({ message: "Post created successfully", post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.updatePost = async (req, res) => {
    try {
        const userId = req.userId;
        const { postId } = req.params;
        const { content, image, video } = req.body;
        const post = await communityService.updatePost({ userId, postId, content, image, video });
        res.status(200).json({ message: "Post updated successfully", post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.deletePost = async (req, res) => {
    try {
        const userId = req.userId;
        const { postId } = req.params;
        await communityService.deletePost({ userId, postId });
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.likePost = async (req, res) => {
    try {
        const userId = req.userId;
        const { postId } = req.params;
        const post = await communityService.likePost({ userId, postId });
        res.status(200).json({ message: "Post liked/unliked", post });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.addComment = async (req, res) => {
    try {
        const userId = req.userId;
        const { postId, content, parentId } = req.body;
        const comment = await communityService.addComment({ userId, postId, content, parentId });
        res.status(201).json({ message: "Comment added", comment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await communityService.getPostComments({ postId });
        res.status(200).json({ comments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.likeComment = async (req, res) => {
    try {
        const userId = req.userId;
        const { commentId } = req.params;
        const comment = await communityService.likeComment({ userId, commentId });
        res.status(200).json({ message: "Comment liked/unliked", comment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getCommunityMessages = async (req, res) => {
    try {
        const { communityId } = req.params;
        const messages = await communityService.getCommunityMessages({ communityId });
        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.userId;
        const { communityId, content } = req.body;
        const message = await communityService.createMessage({ communityId, senderId, content });
        res.status(201).json({ message: "Message sent successfully", chatMessage: message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
