const chatService = require("../Services/chat.service");

// send message
module.exports.sendMessage = async (req,res) =>{
    const {receiverId, connectionId, content} = req.body;
    const senderId = req.userId;
    try{
        const chat = await chatService.sendMessage({senderId, receiverId, connectionId, content});
        return res.status(201).json({message:"Message sent successfully"});
    } catch(error){
        return res.status(500).json({error: error.message});
    }
}

// get chat history
module.exports.getHistory = async (req, res) => {
    const { connectionId } = req.params;
    try {
        const history = await chatService.getChatHistory(connectionId);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};