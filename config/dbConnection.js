const mongoose = require('mongoose');
require('dotenv').config()

const MONGOOSE = process.env.MONGOOSE

module.exports.connectDB = () => {
    mongoose.connect(MONGOOSE, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => {
            console.log('Database Connected');
        })
        .catch((err) => {
            console.error('Error connecting to database:', err);
        });
};
