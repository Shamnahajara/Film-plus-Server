const mongoose = require('mongoose');
const MONGOOSE = process.env.MONGOOSE

module.exports.connectDB = () => {
    mongoose.connect('mongodb://127.0.0.1:27017/film-plus', {
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
