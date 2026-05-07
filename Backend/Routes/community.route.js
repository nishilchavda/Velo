const express = require("express");
const userMiddleware = require("../Middlewares/user.middleware");
const communityController = require("../Controllers/community.controller");

const router = express.Router();

// Public routes (Non-logged in users can see)
router.get("/all", communityController.getAllCommunities);
router.get("/get/:communityId", communityController.getCommunityDetail);
router.get("/posts/all", communityController.getAllPosts);
router.get("/posts/:communityId", communityController.getCommunityPosts);
router.get("/posts/user/:userId", communityController.getUserPosts);
router.get("/user-communities/:userId", communityController.getUserJoinedCommunities);
router.get("/post/:postId/comments", communityController.getPostComments);

// Protected routes (Require login)
router.get("/my-communities", userMiddleware.authUser, communityController.getUserCommunities);
router.post("/create", userMiddleware.authUser, communityController.createCommunity);
router.put("/update/:communityId", userMiddleware.authUser, communityController.updateCommunity);
router.delete("/delete/:communityId", userMiddleware.authUser, communityController.deleteCommunity);
router.post("/join/:communityId", userMiddleware.authUser, communityController.joinCommunity);
router.post("/leave/:communityId", userMiddleware.authUser, communityController.leaveCommunity);

// Interactions
router.post("/post/create", userMiddleware.authUser, communityController.createPost);
router.put("/post/:postId/update", userMiddleware.authUser, communityController.updatePost);
router.delete("/post/:postId/delete", userMiddleware.authUser, communityController.deletePost);
router.post("/post/:postId/like", userMiddleware.authUser, communityController.likePost);
router.post("/post/comment", userMiddleware.authUser, communityController.addComment);
router.post("/comment/:commentId/like", userMiddleware.authUser, communityController.likeComment);

// Real-time Chat
router.get("/messages/:communityId", userMiddleware.authUser, communityController.getCommunityMessages);
router.post("/message/send", userMiddleware.authUser, communityController.sendMessage);

module.exports = router;
