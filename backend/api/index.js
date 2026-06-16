function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.setHeader("Access-Control-Max-Age", "86400");
}

// Vercel Serverless entry point.
// CORS headers are set immediately — before any require() or async work —
// so even platform-level timeouts/crashes return browser-readable errors.
module.exports = async (req, res) => {
  // Always set CORS first, no matter what happens next
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const app = require("../src/index.js");
    return await new Promise((resolve, reject) => {
      // Wrap in a promise so async errors are caught
      try {
        const result = app(req, res);
        if (result && typeof result.then === "function") {
          result.then(resolve).catch(reject);
        } else {
          resolve(result);
        }
      } catch (err) {
        reject(err);
      }
    });
  } catch (error) {
    console.error("API handler failed:", error);
    // CORS headers already set above — safe to respond
    if (!res.headersSent) {
      setCorsHeaders(res); // re-set in case something cleared them
      return res.status(500).json({
        success: false,
        error: "HANDLER_FAILURE",
        message: error.message,
      });
    }
  }
};
