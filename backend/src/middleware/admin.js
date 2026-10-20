module.exports = (req, res, next) =>
  req.user.role === "Admin"
    ? next()
    : res.status(403).json({ message: "Admin only" });
