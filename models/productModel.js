const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  productName:{
    type:String,
    required:true
  },

  description: {
    type: String,
    required : true
  },

  productImage:{
     type:Array
  },

  rentPrice:{
    type:Number,
    required: true
  },

  reviews: [
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          review : {
            type :String,
            required:true
        }
    }, 
  ], 

 locationName:{
    type:String,
    required:true
 },
 longitude:{
  type:Number
},
 latitude:{
  type:Number
},
 isRented:{
   type:Boolean,
   default : false
 },
  isUnlisted :{
     type:Boolean,
     default : false
 }

});

module.exports = mongoose.model("RentProduct", ProductSchema);