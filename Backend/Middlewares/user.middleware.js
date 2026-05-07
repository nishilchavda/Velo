const userModel = require("../Models/user.model");
const jwt = require("jsonwebtoken");

module.exports.authUser = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token){
        return res.status(401).json({message: "Authentication token missing. Please login."});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user = await userModel.findOne({_id: decoded._id});

        if(!user){
            return res.status(401).json({message: "Unauthorized!"});
        }

        req.userId = user._id; // Restore this to avoid breaking controllers
        return next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token. Please login again.", error: error.message });
    }
}