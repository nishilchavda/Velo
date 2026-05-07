const notificationService = require("../Services/notification.service");

module.exports.getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const notifications = await notificationService.getUserNotifications({ userId });
        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.markAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        const { notificationId } = req.params;
        const notification = await notificationService.markAsRead({ userId, notificationId });
        res.status(200).json({ notification });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.markAllRead = async (req, res) => {
    try {
        const userId = req.userId;
        await notificationService.markAllAsRead({ userId });
        res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.userId;
        const count = await notificationService.getUnreadCount({ userId });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
