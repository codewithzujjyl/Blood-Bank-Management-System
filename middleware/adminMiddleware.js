const {pool} = require("../config/db"); // Import MySQL connection pool

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const connection = await pool.getConnection(); // Get connection from pool

    try {
      const [rows] = await connection.execute(
        "SELECT role FROM users WHERE id = ?",
        [req.body.userId]
      );

      if (!rows.length || rows[0].role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      next(); // User is an admin, proceed to the next middleware
    } finally {
      connection.release(); // Release connection back to pool
    }
  } catch (error) {
    console.error("MySQL Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error - Admin Authentication",
      error: error.message,
    });
  }
};

module.exports = adminAuthMiddleware;
