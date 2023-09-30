const mongoose = require('mongoose');

const chatModel = mongoose.Schema(
    {
        chatName: {
            type: String,
        },
        isGroupchat: {
            type: Boolean,
            default: false
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        groupProfile : {
            type: String,
            default :"https://www.tenniscall.com/images/chat.jpg"
        },
        requested: {
            requestId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            accepted: {
                type: Boolean,
                default: false
            }
        },
        aboutGroup:{
            type:String,
            default:"Give description about your community "
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Chat", chatModel);