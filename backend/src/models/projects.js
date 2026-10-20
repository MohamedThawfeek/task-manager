const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    project_access: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    board_status: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "statuses",
      },
    ],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      require: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "hold", "completed"],
      default: "active",
    },
    progress: { type: Number, default: 0 },
    due_date: { type: String, default: null },
  },
  { timestamps: true },
);

const Project = mongoose.model("projects", schema);

module.exports = Project;
