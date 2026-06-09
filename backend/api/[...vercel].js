module.exports = (req, res) => {
  try {
    const app = require("../src/index.js");
    return app(req, res);
  } catch (error) {
    res.status(500).json({
      error: "MODULE_LOAD_FAILURE",
      message: error.message,
      stack: error.stack
    });
  }
};
