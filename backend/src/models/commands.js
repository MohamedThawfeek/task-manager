const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    task_id: { type: mongoose.Schema.Types.ObjectId, ref: "task" },
    command: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true },
);

const Commands = mongoose.model("commands", schema);

module.exports = Commands;
