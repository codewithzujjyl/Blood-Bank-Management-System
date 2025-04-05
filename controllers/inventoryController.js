const {pool} = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Create Inventory
const createInventoryController = async (req, res) => {
  try {
    const { email, inventoryType, bloodGroup, quantity, userId } = req.body;

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];

    if (!user) {
      console.log("USER NOT FOUND");
      return res.status(404).send({ success: false, message: "User not found" });
    }

    if (inventoryType === "out") {
      const [[{ totalIn = 0 } = {}]] = await pool.query(
        `SELECT SUM(quantity) as totalIn FROM inventory
         WHERE organisation = ? AND inventoryType = 'in' AND bloodGroup = ?`,
        [userId, bloodGroup]
      );

      const [[{ totalOut = 0 } = {}]] = await pool.query(
        `SELECT SUM(quantity) as totalOut FROM inventory
         WHERE organisation = ? AND inventoryType = 'out' AND bloodGroup = ?`,
        [userId, bloodGroup]
      );

      const availableQuantity = totalIn - totalOut;

      if (availableQuantity < quantity) {
        return res.status(400).send({
          success: false,
          message: `Only ${availableQuantity}ml of ${bloodGroup.toUpperCase()} is available`,
        });
      }
    }

    const id = uuidv4();
    const query = `
      INSERT INTO inventory (
        id, inventoryType, bloodGroup, quantity, email, organisation, hospital, donar, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    const values = [
      id,
      inventoryType,
      bloodGroup,
      quantity,
      email,
      userId,
      inventoryType === "out" ? user.id : null,
      inventoryType === "in" ? user.id : null,
    ];

    await pool.query(query, values);

    res.status(201).send({
      success: true,
      message: "New Blood Record Added",
    });
  } catch (err) {
    console.error("Error in creating inventory: ", err);
    res.status(500).send({
      success: false,
      message: "Error in creating inventory",
      error: err.message,
    });
  }
};

// Get all inventory for an organisation
const getInventoryController = async (req, res) => {
  try {
    const [inventory] = await pool.query(
      `SELECT i.*, u1.name AS donarName, u2.name AS hospitalName 
       FROM inventory i
       LEFT JOIN users u1 ON i.donar = u1.id
       LEFT JOIN users u2 ON i.hospital = u2.id
       WHERE i.organisation = ?
       ORDER BY i.createdAt DESC`,
      [req.body.userId]
    );

    res.status(200).send({
      success: true,
      message: "Get all records successfully",
      inventory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in getting all inventory",
      error,
    });
  }
};

// Get inventory filtered (for hospitals)
const getInventoryHospitalController = async (req, res) => {
  try {
    const filters = req.body.filters || {};
    let whereClause = "WHERE 1=1";
    const values = [];

    for (const key in filters) {
      whereClause += ` AND ${key} = ?`;
      values.push(filters[key]);
    }

    const [inventory] = await pool.query(
      `SELECT i.*, u1.name AS donarName, u2.name AS hospitalName, u3.name AS organisationName 
       FROM inventory i
       LEFT JOIN users u1 ON i.donar = u1.id
       LEFT JOIN users u2 ON i.hospital = u2.id
       LEFT JOIN users u3 ON i.organisation = u3.id
       ${whereClause}
       ORDER BY i.createdAt DESC`,
      values
    );

    res.status(200).send({
      success: true,
      message: "Hospital consumer records fetched successfully",
      inventory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in getInventoryHospitalController",
      error,
    });
  }
};

// Get recent 3 records
const getRecentInventoryController = async (req, res) => {
  try {
    const [inventory] = await pool.query(
      `SELECT * FROM inventory WHERE organisation = ? ORDER BY createdAt DESC LIMIT 3`,
      [req.body.userId]
    );

    res.status(200).send({
      success: true,
      message: "Recent inventory data",
      inventory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in Recent Inventory API",
      error,
    });
  }
};

// Get Donars for Organisation
const getDonarsController = async (req, res) => {
  try {
    const [donarIds] = await pool.query(
      `SELECT DISTINCT donar FROM inventory WHERE organisation = ? AND donar IS NOT NULL`,
      [req.body.userId]
    );

    const ids = donarIds.map(d => d.donar);
    if (!ids.length) return res.send({ success: true, donars: [] });

    const [donars] = await pool.query(`SELECT * FROM users WHERE id IN (?)`, [ids]);

    res.status(200).send({
      success: true,
      message: "Donar Record Fetched Successfully",
      donars,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in Donar records",
      error,
    });
  }
};

// Get Hospitals for Organisation
const getHospitalController = async (req, res) => {
  try {
    const [hospitalIds] = await pool.query(
      `SELECT DISTINCT hospital FROM inventory WHERE organisation = ? AND hospital IS NOT NULL`,
      [req.body.userId]
    );

    const ids = hospitalIds.map(h => h.hospital);
    if (!ids.length) return res.send({ success: true, hospitals: [] });

    const [hospitals] = await pool.query(`SELECT * FROM users WHERE id IN (?)`, [ids]);

    res.status(200).send({
      success: true,
      message: "Hospitals Data Fetched Successfully",
      hospitals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in getHospital API",
      error,
    });
  }
};

// Get Organisations for Donar
const getOrgnaisationController = async (req, res) => {
  try {
    const [orgIds] = await pool.query(
      `SELECT DISTINCT organisation FROM inventory WHERE donar = ?`,
      [req.body.userId]
    );

    const ids = orgIds.map(o => o.organisation);
    if (!ids.length) return res.send({ success: true, organisations: [] });

    const [organisations] = await pool.query(`SELECT * FROM users WHERE id IN (?)`, [ids]);

    res.status(200).send({
      success: true,
      message: "Org Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error In ORG API",
      error,
    });
  }
};

// Get Organisations for Hospital
const getOrgnaisationForHospitalController = async (req, res) => {
  try {
    const [orgIds] = await pool.query(
      `SELECT DISTINCT organisation FROM inventory WHERE hospital = ?`,
      [req.body.userId]
    );

    const ids = orgIds.map(o => o.organisation);
    if (!ids.length) return res.send({ success: true, organisations: [] });

    const [organisations] = await pool.query(`SELECT * FROM users WHERE id IN (?)`, [ids]);

    res.status(200).send({
      success: true,
      message: "Hospital Org Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error In Hospital ORG API",
      error,
    });
  }
};

module.exports = {
  createInventoryController,
  getInventoryController,
  getInventoryHospitalController,
  getRecentInventoryController,
  getDonarsController,
  getHospitalController,
  getOrgnaisationController,
  getOrgnaisationForHospitalController,
};
