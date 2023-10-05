const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  
    rentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rent', 
    },
    amount: {
        type: Number,
    },
    date: {
        type: Date,
    }
});

const RevenueModel = mongoose.model('Revenue', revenueSchema);

module.exports = RevenueModel;
