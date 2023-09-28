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
        requested: {
            requestId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            accepted: {
                type: Boolean,
                default: false
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Chat", chatModel);