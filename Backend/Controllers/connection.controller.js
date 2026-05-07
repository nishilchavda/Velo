const connectionService = require("../Services/connection.service");

module.exports.sendRequest = async (req, res) => {
    try {
        const senderId = req.userId;
        const { receiverId, movementId } = req.body;
        const conn = await connectionService.sendRequest({ senderId, receiverId, movementId });
        res.status(200).json({ conn });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.getPendingRequests = async (req, res) => {
    try {
        const receiverId = req.userId;
        const conn = await connectionService.pendingRequests({ receiverId });
        res.status(200).json({ conn });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.updateStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const { connectionId, newStatus } = req.body;
        const conn = await connectionService.updateStatus({ connectionId, userId, newStatus });
        res.status(200).json({ conn });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.getMyConnections = async (req, res) => {
    try {
        const userId = req.userId;
        const conn = await connectionService.getMyConnections({ userId });
        res.status(200).json({ conn });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const notifications = await connectionService.getAllNotifications({ userId });
        res.status(200).json({ notifications });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.getBuddyCount = async (req, res) => {
    try {
        const { userId } = req.params;
        const count = await connectionService.getBuddyCount({ userId });
        res.status(200).json({ count });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.removeConnection = async (req, res) => {
    try {
        const userId = req.userId;
        const { targetUserId } = req.params;
        await connectionService.removeConnection({ userId, targetUserId });
        res.status(200).json({ message: "Connection removed" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.getUserBuddies = async (req, res) => {
    try {
        const { userId } = req.params;
        const buddies = await connectionService.getUserBuddies({ userId });
        res.status(200).json({ buddies });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};