const express = require("express");
const router = express.Router();
const userMiddleware = require("../Middlewares/user.middleware");
const chatController = require("../Controllers/chat.controller");

router.post("/send", userMiddleware.authUser, chatController.sendMessage);
router.get(
  "/history/:connectionId",
  userMiddleware.authUser,
  chatController.getHistory,
);

module.exports = router;
