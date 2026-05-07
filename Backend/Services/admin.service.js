const userModel = require("../Models/user.model");

// get all user
module.exports.getAllUsers = async () => {
  const allusers = await userModel.find();
  return allusers;
};

// delete user
module.exports.deleteUser = async (id) => {
  const user = await userModel.findOneAndDelete({ _id: id });

  return user;
};

// update user
module.exports.updateUser = async ({userId, role}) => {
  return await userModel.findByIdAndUpdate(
    { _id: userId },
    { role },
    { returnDocument: 'after' },
  );
};
