const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: "project" },
    status_type: { type: String },
    color: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true },
);

const Status = mongoose.model("statuses", schema);

module.exports = Status;
