const {
  getNotification,
  updateNotification,
} = require("../../handler/notification");

exports.GetNotifications = async function (req, res) {
  const response = await getNotification(req);
  return res.status(response.responseCode).send(response);
};

exports.UpdateNotification = async function (req, res) {
  const { notification_id } = req.body;
  if (!notification_id) {
    return res.status(400).send({
      status: false,
      responseCode: 400,
      message: "Notification ID is required",
    });
  }
  const response = await updateNotification(req);
  return res.status(response.responseCode).send(response);
};
