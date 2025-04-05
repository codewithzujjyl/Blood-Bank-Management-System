const {pool} = require("../config/db");

// GET DONOR LIST
const getDonarsListController = async (req, res) => {
  try {
    const [donarData] = await pool.execute(
      "SELECT * FROM users WHERE role = ? ORDER BY created_at DESC",
      ["donar"]
    );

    return res.status(200).send({
      success: true,
      totalCount: donarData.length,
      message: "Donor List Fetched Successfully",
      donarData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error in Donor List API",
      error,
    });
  }
};

// GET HOSPITAL LIST
const getHospitalListController = async (req, res) => {
  try {
    const [hospitalData] = await pool.execute(
      "SELECT * FROM users WHERE role = ? ORDER BY created_at DESC",
      ["hospital"]
    );

    return res.status(200).send({
      success: true,
      totalCount: hospitalData.length,
      message: "Hospital List Fetched Successfully",
      hospitalData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error in Hospital List API",
      error,
    });
  }
};

// GET ORGANIZATION LIST
const getOrgListController = async (req, res) => {
  try {
    const [orgData] = await pool.execute(
      "SELECT * FROM users WHERE role = ? ORDER BY created_at DESC",
      ["organisation"]
    );

    return res.status(200).send({
      success: true,
      totalCount: orgData.length,
      message: "Organization List Fetched Successfully",
      orgData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error in Organization List API",
      error,
    });
  }
};

// DELETE DONOR
const deleteDonarController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID before executing the query
    if (!id || isNaN(id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid or missing donor ID",
      });
    }

    const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send({
        success: false,
        message: "No donor found with the given ID",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Donor deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error while deleting donor",
      error,
    });
  }
};


// EXPORT
module.exports = {
  getDonarsListController,
  getHospitalListController,
  getOrgListController,
  deleteDonarController,
};
