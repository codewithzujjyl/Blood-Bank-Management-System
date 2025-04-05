const {pool} = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER USER
const registerController = async (req, res) => {
  try {
    console.log(req.body);
    const {
      name,
      email,
      password,
      role,
      address,
      organisationName,
      hospitalName,
      website,
      phone,
    } = req.body;

    // Check if user already exists
    const [existingUser] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(200).send({
        success: false,
        message: "User Already Exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare fields
    const userName = role === "admin" || role === "donar" ? name || null : null;
    const orgName = role === "organisation" ? organisationName || null : null;
    const hospName = role === "hospital" ? hospitalName || null : null;

    // Avoid undefined values — fallback to null
    const finalWebsite = website || null;
    const finalAddress = address || null;
    const finalPhone = phone || null;

    // Insert new user
    await pool.execute(
      `INSERT INTO users 
        (name, organisation_name, hospital_name, email, password, role, website, address, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userName,
        orgName,
        hospName,
        email,
        hashedPassword,
        role,
        finalWebsite,
        finalAddress,
        finalPhone,
      ]
    );

    return res.status(201).send({
      success: true,
      message: "User Registered Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error In Register API",
      error,
    });
  }
};



// LOGIN USER
const loginController = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if user exists
    const [userRows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (userRows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const user = userRows[0];

    // Check role
    if (user.role !== role) {
      return res.status(500).send({
        success: false,
        message: "Role doesn't match",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(500).send({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).send({
      success: true,
      message: "Login Successful",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error In Login API",
      error,
    });
  }
};

// GET CURRENT USER
const currentUserController = async (req, res) => {
  try {
    const userId = req.body.userId;
    const [userRows] = await pool.execute("SELECT * FROM users WHERE id = ?", [userId]);

    if (userRows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "User Fetched Successfully",
      user: userRows[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error in getting current user",
      error,
    });
  }
};

module.exports = { registerController, loginController, currentUserController };
