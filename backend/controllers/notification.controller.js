import Notification from "../models/notification.model.js";

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("relatedUser", "name username profilePicture");

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in getUserNotifications, ", error.message);
    return res
      .status(500)
      .json({ message: `Internal server error, ${error.message}` });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification)
      return res.status(400).json({ message: "Notification not found" });
    if (notification.recipient.toString() !== req.user._id)
      return res.status(400).json({
        message: "You are not authorized to edit this notification",
      });

    notification.read = true;
    await notification.save();
    return res
      .status(200)
      .json({ message: "Notification updated successfully", notification });
  } catch (error) {
    console.error("Error in mark notification as read, ", error.message);
    return res
      .status(500)
      .json({ message: `Internal server error, ${error.message}` });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification)
      return res.status(400).json({ message: "Notification not found" });

    await Notification.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error in mark notification as read, ", error.message);
    return res
      .status(500)
      .json({ message: `Internal server error, ${error.message}` });
  }
};
