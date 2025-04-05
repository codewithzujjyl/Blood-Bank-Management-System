const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    JWT.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      req.body.userId = decoded.userId; // Attach decoded userId to request
      next(); // Proceed to the next middleware
    });

  } catch (error) {
    console.error("JWT Auth Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in authentication",
      error: error.message,
    });
  }
};
