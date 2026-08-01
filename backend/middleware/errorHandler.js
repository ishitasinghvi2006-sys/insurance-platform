function errorHandler(err, req, res, next) {
  console.error(err);

  // Prisma known errors
  if (err.code === "P2002") {
    return res.status(400).json({ success: false, message: "A record with this value already exists" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, message: "Record not found" });
  }

  // Multer file errors
  if (err.message && err.message.includes("Only PDF, JPG")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "File too large (max 5MB)" });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong on the server",
  });
}

module.exports = errorHandler;