const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").match(
      /^Bearer (.+)$/i,
    )?.[1];
    if (!token)
      return res.status(401).json({ message: "Bearer token required" });
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    const user = await User.findById(payload.sub).select("_id role name");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
