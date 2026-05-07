module.exports.authAdmin = async (req, res, next)=>{
    const user = req.user;

    // check user or user role
    if(user.role !== "admin"){
        return res.status(400).json({message: "You are not Authorized!"});
    }

    next();
}