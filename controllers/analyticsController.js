const {pool} = require("../config/db");

// GET BLOOD DATA
const bloodGroupDetailsContoller = async (req, res) => {
  try {
    const bloodGroups = ["O+", "O-", "AB+", "AB-", "A+", "A-", "B+", "B-"];
    const bloodGroupData = [];
    const organisationId = req.body.userId; // Directly using userId since no ObjectId conversion is needed

    // Process each blood group
    for (const bloodGroup of bloodGroups) {
      // Count TOTAL IN
      const [totalInRows] = await pool.execute(
        `SELECT SUM(quantity) AS total FROM inventory 
         WHERE bloodGroup = ? AND inventoryType = 'in' AND organisation = ?`,
        [bloodGroup, organisationId]
      );
      const totalIn = totalInRows[0]?.total || 0;

      // Count TOTAL OUT
      const [totalOutRows] = await pool.execute(
        `SELECT SUM(quantity) AS total FROM inventory 
         WHERE bloodGroup = ? AND inventoryType = 'out' AND organisation = ?`,
        [bloodGroup, organisationId]
      );
      const totalOut = totalOutRows[0]?.total || 0;

      // Calculate AVAILABLE BLOOD
      const availabeBlood = totalIn - totalOut;

      // Push Data
      bloodGroupData.push({
        bloodGroup,
        totalIn,
        totalOut,
        availabeBlood,
      });
    }

    return res.status(200).send({
      success: true,
      message: "Blood Group Data Fetched Successfully",
      bloodGroupData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error in Blood Group Data Analytics API",
      error,
    });
  }
};

module.exports = { bloodGroupDetailsContoller };
