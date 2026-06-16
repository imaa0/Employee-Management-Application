// Import app at the top level so Vercel's static bundler (ncc) includes
// the entire src/ directory in the deployment. If require() is inside a
// function/try-catch, ncc won't trace it and the module won't be deployed.
const app = require("../src/index.js");

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.setHeader("Access-Control-Max-Age", "86400");
}

// Vercel Serverless entry point.
// CORS headers are set immediately — before Express runs —
// so even crashes return browser-readable errors.
module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    return await new Promise((resolve, reject) => {
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
    if (!res.headersSent) {
      setCorsHeaders(res);
      return res.status(500).json({
        success: false,
        error: "HANDLER_FAILURE",
        message: error.message,
      });
    }
  }
};
