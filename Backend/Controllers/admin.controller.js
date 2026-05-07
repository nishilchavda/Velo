const userModel = require("../Models/user.model");
const adminService = require("../Services/admin.service");
const { validationResult } = require("express-validator");

// get all users
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    return res
      .status(200)
      .json({ message: "Users Fetch Successfully!", users });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// delete user
module.exports.deleteUser = async (req, res) => {
  try {
    const user = await adminService.deleteUser(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User Not Found!" });
    }

    return res.status(200).json({ message: "User Delete Successfully!" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// update user
module.exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const updatedUser = await adminService.updateUser({ userId, role });

    if (!updatedUser) {
      throw new Error("User Not Found!");
    }

    return res.status(200).json({ message: "User Updated Successfully!" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
