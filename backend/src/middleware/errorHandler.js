const { ZodError } = require("zod");

function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Zod validation error
  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: formatted,
    });
  }

  // Custom app errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Fallback
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}

module.exports = { errorHandler };
