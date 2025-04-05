const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
require('dotenv').config();
const cors = require('cors');
const db = require('./config/db.js');
const {setupDatabase} = require('./config/db.js');



const app = express();


//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/test',require('./routes/testRroute.js'))
app.use('/api/v1/auth',require('./routes/authRoute.js'))
app.use('/api/v1/inventory',require('./routes/inventoryRoutes.js'))
app.use('/api/v1/analytics',require('./routes/analyticsRoutes.js'))
app.use("/api/v1/admin", require("./routes/adminRoutes.js"));


const PORT = 8080;
setupDatabase()

app.listen(PORT, ()=> console.log(`Server running in ${PORT}`.bgBlue.white ));