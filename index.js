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
    origin: [BACKENDURL, FRONTENDURL, "https://www.filmplus.website", "https://filmplus.website"],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}


app.use(cors(corsOptions));
app.use(express.json({ limit: '100mb', extended: true }));
app.use(cookieParser())
app.use('/user', userRoute);
app.use('/admin', adminRoute);

connectDB()

const server = app.listen(PORT, () => {
    console.log(`server running at ${PORT}`)
});

const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        credentials: true
    }
})

io.on('connection', (socket) => {

    socket.on('setup', (userId) => {
        socket.join(userId)
        socket.emit('connected')
    })

    socket.on('joinChat', (room) => {
        socket.join(room);
    })

    socket.on('new message', (newMessage, room) => {
        io.emit('messageResponse', newMessage, room);
        console.log(newMessage)
    });

    socket.on('disconnect', () => {
        console.log("Socket disconnected");
    });
})


