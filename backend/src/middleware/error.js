module.exports = (error, req, res, next) => {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  return res.status(error.statusCode || 500).json({
    message:
      error.statusCode && error.statusCode < 500
        ? error.message
        : error.statusCode === 503
          ? "AI service is currently unavailable. Please try again."
          : "Internal server error",
  });
};
