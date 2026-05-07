const express = require("express");
const router = express.Router();
const userMiddleware = require("../Middlewares/user.middleware");
const adminMiddleware = require("../Middlewares/admin.middleware");
const adminController = require("../Controllers/admin.controller");

router.get(
  "/all",
  userMiddleware.authUser,
  adminMiddleware.authAdmin,
  adminController.getAllUsers,
);
router.delete(
  "/delete/:id",
  userMiddleware.authUser,
  adminMiddleware.authAdmin,
  adminController.deleteUser,
);
router.put(
  "/update/:id",
  userMiddleware.authUser,
  adminMiddleware.authAdmin,
  adminController.updateUser,
);

module.exports = router;
