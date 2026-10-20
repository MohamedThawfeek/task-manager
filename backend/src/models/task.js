const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    due_date: { type: String, default: null },
    assigned_to: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    ],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    todos: [
      {
        title: { type: String },
        completed: { type: Boolean, default: false },
        created_by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        updated_by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
          default: null,
        },
        updated_time: { type: String },
      },
    ],
    attachments: [{ type: String }],
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      default: null,
    },
    status_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "statuses",
      default: null,
    },
    updated_by: [
      { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null },
    ],
  },
  { timestamps: true },
);

const Task = mongoose.model("tasks", schema);

module.exports = Task;
