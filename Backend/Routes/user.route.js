const express = require("express");
const { body } = require("express-validator");
const userController = require("../Controllers/user.controller");
const middleware = require("../Middlewares/user.middleware");

const router = express.Router();

router.post(
  "/signup",
  [
    body("username")
      .isLength({ min: 4 })
      .withMessage("Username must be atleast 4 characters long"),
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be atleast 6 characters long"),
  ],
  userController.createUser,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be atleast 6 characters long"),
  ],
  userController.login,
);


router.get("/profile", middleware.authUser, userController.profile);
router.get("/profile/:userId", userController.getPublicProfile);

router.put("/update", middleware.authUser, userController.updateProfile);

router.get("/logout", middleware.authUser, userController.logout);

module.exports = router;