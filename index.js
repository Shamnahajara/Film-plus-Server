const morgan = require("morgan");
const express = require("express");
const cors = require("cors");  
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/dbConnection');
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin')
require('dotenv').config()
const PORT = process.env.PORT
const FRONTENDURL = process.env.FRONTEND_URL
const BACKENDURL = process.env.BACKEND_URL


const app = express();
app.use(morgan("dev"));
const corsOptions = {
    origin: [BACKENDURL, FRONTENDURL],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
} 

app.use(cors(corsOptions));
app.use(express.json({ limit: '100mb', extended: true }));
app.use(cookieParser())
app.use('/user', userRoute);
app.use('/admin', adminRoute);

connectDB()

app.listen(PORT, () => {
    console.log(`server running at ${PORT}`)
});
