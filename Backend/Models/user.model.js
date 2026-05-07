const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 4,
    unique: true,
    required: true,
    lowercase: true,
  },
  fullname: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  profileImage: {
    type: String,
    default: ""
  },
  bannerImage: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: ""
  },
  hometown: {
    type: String,
    default: ""
  },
  tags: {
    vibe: [{ type: String }],
    interests: [{ type: String }],
    professional: [{ type: String }],
  },
});

// creating indexes for fast searching (Removed parallel array index to fix MongoDB crash)
// userSchema.index({ "tags.vibe":1 }); 
// userSchema.index({ "tags.interests":1 }); 


// jwt token generation
userSchema.methods.generateToken = function () {
  let token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

// bcrypt
userSchema.statics.hashPassword = async function (password) {
  let hash = await bcrypt.hash(password, 10);
  return hash;
};

// compare password
userSchema.methods.comparePassword = async function (password) {
  let match = await bcrypt.compare(password, this.password);
  return match;
};

module.exports = mongoose.model("User", userSchema);
