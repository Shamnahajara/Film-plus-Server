const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({

    sender : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    message:{
        type:String,
        trim:true
    },
    providerChat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ChatProvider"
    },
    communityChat: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat"
    },
},
{
    timestamps:true
}
)

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;