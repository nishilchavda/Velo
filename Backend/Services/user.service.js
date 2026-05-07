const userModel = require("../Models/user.model");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// create user
module.exports.createUser = async ({ username, email, password, role }) => {
  if (!username || !email || !password) {
    throw new Error("All Field Are Requried!");
  }

  const user = await userModel.create({ username, email, password, role });

  return user;
};

// update user
module.exports.updateUser = async ({ userId, username, fullname, profileImage, bannerImage, bio, hometown, tags }) => {
  const updatedUser = await userModel.findOneAndUpdate(
    { _id: userId },
    { 
      $set: { 
        username, 
        fullname,
        profileImage, 
        bannerImage,
        bio, 
        hometown,
        tags 
      } 
    },
    { returnDocument: 'after', runValidators: true }
  );

  if (!updatedUser) {
    throw new Error("User Not Found!");
  }

  return updatedUser;
};