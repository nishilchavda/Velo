const userService = require("../Services/user.service");
const { validationResult} = require("express-validator");
const userModel = require("../Models/user.model");

// signup 
module.exports.createUser = async (req, res, next) => {
    try {
        const error = validationResult(req);

        if (!error.isEmpty()){
            return res.status(400).json({error: error.array()});
        }

        const {username, email, password, role} = req.body;

        const isExists = await userModel.findOne({ email });
        if (isExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const hashPassword = await userModel.hashPassword(password);

        const user = await userService.createUser({
            username,
            email,
            password: hashPassword,
            role,
        })

        const token = await user.generateToken();

        res.status(200).json({token,user});
    } catch (err) {
        console.error("Error in createUser:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

// login
module.exports.login = async (req, res) =>{
    try {
        let error = validationResult(req);
        if (!error.isEmpty()){
            return res.status(400).json({error: error.array()});
        }

        let {email, password} = req.body;

        let checkUser = await userModel.findOne({email: email}).select("+password");

        if(!checkUser){
            return res.status(404).json({message: "Email is Invalid!"});
        }

        let isMatched = await checkUser.comparePassword(password);

        if(!isMatched){
            return res.status(401).json({message: "Invalid Password!"});
        }

        const token = await checkUser.generateToken();

        res.status(200).json({token,checkUser});
    } catch (err) {
        console.error("Error in login:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

// profile
module.exports.profile = async (req,res)=>{
    const userId = req.userId;
    try {
        const user = await userModel.findOne({_id:userId});
        return res.status(200).json({user});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

// public profile
module.exports.getPublicProfile = async (req,res)=>{
    const { userId } = req.params;
    try {
        const user = await userModel.findOne({_id:userId});
        if(!user) return res.status(404).json({message: "User not found"});
        return res.status(200).json({user});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

// update profile
module.exports.updateProfile = async (req,res)=>{
    try {
        const userId = req.userId;
        const { username, fullname, profileImage, bannerImage, bio, hometown, tags } = req.body;

        const updateUser = await userService.updateUser({ 
            userId, 
            username, 
            fullname,
            profileImage, 
            bannerImage,
            bio, 
            hometown, 
            tags 
        });

        if(!updateUser){
            throw new Error("User Not Found!");
        }

        return res.status(200).json({message: "User Updated Successfully!", updateUser});

    } catch (err) {
        return res.status(400).json({message: err.message});
    }
}

// logout
module.exports.logout = async (req,res)=>{
    res.clearCookie("token");
    res.status(200).json({message: "Logout Successfully!"});
}