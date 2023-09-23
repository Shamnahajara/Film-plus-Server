const mongoose = require('mongoose');

const ProviderChatModel = mongoose.Schema({
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ]
},
{
  timestamps : true
}
);

module.exports = mongoose.model("ChatProvider", ProviderChatModel);
