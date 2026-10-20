const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, default: null },
    profile: { type: String, default: null },
    phone: { type: String, default: null },
    role: { type: String, default: null },
    access: { type: String, enum: ["Admin", "User"], default: "User" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true },
);

const User = mongoose.model("users", schema);

module.exports = User;
