const express = require("express");
const router = express.Router();
const notificationController = require("../Controllers/notification.controller");
const userMiddleware = require("../Middlewares/user.middleware");

router.get("/", userMiddleware.authUser, notificationController.getNotifications);
router.get("/unread-count", userMiddleware.authUser, notificationController.getUnreadCount);
router.put("/mark-all-read", userMiddleware.authUser, notificationController.markAllRead);
router.put("/:notificationId/read", userMiddleware.authUser, notificationController.markAsRead);

module.exports = router;
