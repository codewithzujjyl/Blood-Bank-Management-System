const mysql = require('mysql2/promise');
require('colors');
const {createUsersTableSQL} = require('../models/userModel.js')
const {createInventoryTableSQL} = require('../models/inventoryModel.js')

console.log(process.env.MYSQL_PASSWORD)

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,  // Example: 'localhost'
    user: process.env.MYSQL_USER,  // Example: 'root'
    password: process.env.MYSQL_PASSWORD, // Example: 'yourpassword'
    database: process.env.MYSQL_DATABASE, // Example: 'yourdbname'
    waitForConnections: true,
    connectionLimit: 10,  // Maximum number of connections in the pool
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log(`✅ Connected to MySQL Database: ${connection.config.host}`.bgCyan.white);
        connection.release(); // Release the connection back to the pool
    })
    .catch(err => {
        console.log(`❌ MySQL Database Error: ${err.message}`.bgRed.white);
        process.exit(1);
    });
    
    const setupDatabase = async () => {
        try {
            await pool.query(createUsersTableSQL);
            console.log("✅ Users table is ready");
        } catch (err) {
            console.error("Error creating users table:", err);
        }
    
        try {
            await pool.query(createInventoryTableSQL);
            console.log("✅ Inventory table is ready");
        } catch (err) {
            console.error("Error creating inventory table:", err);
        }
    };
    

module.exports = {pool,setupDatabase};
