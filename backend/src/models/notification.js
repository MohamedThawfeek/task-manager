const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    project: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    read: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("notifications", schema);

module.exports = Notification;
