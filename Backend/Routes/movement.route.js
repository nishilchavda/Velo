const express = require("express");
const userMiddleware = require("../Middlewares/user.middleware");
const movementController = require("../Controllers/movement.controller");

const router = express.Router();

router.post(
  "/create",
  userMiddleware.authUser,
  movementController.createMovement,
);

router.put(
  "/edit/:movementId",
  userMiddleware.authUser,
  movementController.updateMovement,
);

router.delete(
  "/delete/:movementId",
  userMiddleware.authUser,
  movementController.deleteMovement,
);

router.get(
  "/get/:movementId",
  userMiddleware.authUser,
  movementController.getMovement,
);

router.get(
  "/all",
  userMiddleware.authUser,
  movementController.getAllMovements
);

router.get(
  "/global",
  // userMiddleware.authUser,
  movementController.getGlobalMovements
);

router.get(
  "/match/:movementId",
  userMiddleware.authUser,
  movementController.getMatches
);

router.get(
  "/user/:userId",
  movementController.getUserMovements
);

module.exports = router;
