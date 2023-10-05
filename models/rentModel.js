const mongoose = require('mongoose')

const rentSchema = mongoose.Schema({
  
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'RentProduct',
        required:true
    },
    fromDate:{
        type:Date,
        required:true
    },
    toDate:{
        type:Date,
        required:true
    },
    deliveryLocation :{
        type:String,
        required : true
    },
    amount:{
        type:Number
    },
    returned:{
        type:Boolean,
        default:false
    },
    idProof : {
      type:String,
    },
    bookedAt:{
        type:Date
    },
    commissionAmount:{
        type: Number,
    },
    providerAmount:{
        type: Number
    }
})

module.exports = mongoose.model('Rent',rentSchema)

