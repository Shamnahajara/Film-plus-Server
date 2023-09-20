const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  movieId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Movies'
  },
  rating: {
    type: Number,
  },
  review: {
    type: String,
  }
});

module.exports = mongoose.model("Reviews", reviewSchema);
