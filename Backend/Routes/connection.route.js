const express = require("express");
const userMiddleware = require("../Middlewares/user.middleware");
const connectionController = require("../Controllers/connection.controller");

const router = express.Router();

router.post("/request", userMiddleware.authUser, connectionController.sendRequest);
router.get("/pending", userMiddleware.authUser, connectionController.getPendingRequests);
router.patch("/respond", userMiddleware.authUser, connectionController.updateStatus);
router.get("/my", userMiddleware.authUser, connectionController.getMyConnections);
router.get("/notifications", userMiddleware.authUser, connectionController.getNotifications);
router.get("/count/:userId", connectionController.getBuddyCount);
router.get("/list/:userId", connectionController.getUserBuddies);
router.delete("/remove/:targetUserId", userMiddleware.authUser, connectionController.removeConnection);

module.exports = router;