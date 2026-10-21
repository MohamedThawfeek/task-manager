const { Notification } = require("../../models");

exports.updateNotification = async (req, res) => {
  const { id } = req;
  try {
    const { notification_id } = req.body;

    const updateNotification = await Notification.findOneAndUpdate(
      { _id: notification_id, user_id: id },
      { $set: { read: true } },
      { new: true, runValidators: true },
    );

    if (!updateNotification) {
      return {
        status: false,
        responseCode: 404,
        message: "Notification not found",
      };
    }

    return {
      status: true,
      responseCode: 200,
      message: "Notification updated successfully",
      notification: updateNotification,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to update notification",
      db_error: error.message,
    };
  }
};

exports.getNotification = async (req, res) => {
  const { id } = req;
  try {
    const notifications = await Notification.find({ user_id: id }).sort({
      createdAt: -1,
    });
    return {
      status: true,
      responseCode: 200,
      message: "Notifications fetched successfully",
      notifications,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch notifications",
      db_error: error.message,
    };
  }
};
