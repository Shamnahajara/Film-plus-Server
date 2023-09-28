const communityChatModel = require('../../models/communityChatModel')
const userModel = require("../../models/userModel");
const MessageModel = require('../../models/messageModel')


// ......................................UPDATING USER-INFO FOR GIVING SUGGESION ............................................
const updateUserinfo = async (req, res) => {
  try {
    const { userId } = req.params
    const { interestsData } = req.body

    const user = await userModel.findByIdAndUpdate(userId, {
      favoriteGenre: interestsData.favoriteGenre,
      workingAs: interestsData.workingAs,
      preferredLanguage: interestsData.preferredLanguage,
      communitymember: true
    }, { new: true });

    if (user) {
      return res.status(200).json({ message: 'Success' });
    } else {
      return res.status(403).json({ message: 'Failed to update user data' });
    }

  } catch (err) {
    console.error("updateuserInfo", err)
  }
}


// ...............................................USER-INFO...........................................................................
const userInfo = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await userModel.findOne({ _id: userId }, { password: 0 })
    res.status(200).json({ user: user });
  } catch (err) {
    console.error(userInfo)
  }
}

// ...................................SUGGEST USERS ACCORDING TO USER TASTE .............................................................//
const connectMembers = async (req, res) => {
  try {
    const { userId } = req.params;
    const sessionUser = await userModel.findById(userId);

    const communityChats = await communityChatModel.find({ users: { $elemMatch: { $ne: userId } } })

    const userIDsInCommunityChats = communityChats.reduce((userIDs, chat) => {
      return userIDs.concat(chat.users);
    }, []);

    const uniqueUserIDsInCommunityChats = [...new Set(userIDsInCommunityChats)];

    const similarUsers = await userModel.find({
      _id: { $ne: userId },
      $and: [
        {
          $or: [
            { favoriteGenre: sessionUser.favoriteGenre },
            { workingAs: sessionUser.workingAs },
            { preferredLanguage: sessionUser.preferredLanguage }
          ]
        },
        { _id: { $nin: uniqueUserIDsInCommunityChats } }
      ]

    });

    res.status(200).json({ similarUsers: similarUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


//.........................................CREAT-CHAT-WITH-SUGGESTED-USER..............................................
const createChat = async (req, res) => {
  try {
    const userId = req.payload.id
    const { recieverId } = req.params

    const chat = await communityChatModel.create({
      isGroupChat: false,
      users: [userId, recieverId],
      requested: {
        requestId: userId,
        accepted: false,
      },
    });
  } catch (err) {
    console.error("createChat", err)
  }
}

// ...........................................ACCEPTING -CHAT-REQUEST.............................................................
const acceptReq = async (req, res) => {
  try {
    const { chatId } = req.params;

    const accept = await communityChatModel.findByIdAndUpdate(
      chatId,
      {
        $set: { 'requested.accepted': true },
      },
      { new: true }
    );

    if (accept) {
      res.status(200).json({ message: "You accepted the incoming request" });
    } else {
      res.status(404).json({ message: "No matching document found" });
    }
  } catch (err) {
    console.error("acceptreq", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};





//........................................ACCESS-SESSION USER CHAT LISTS........................................................................
const chatList = async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await communityChatModel.find({ users: { $elemMatch: { $eq: userId } } })
      .populate("users", "-password")
      .sort({ updatedAt: -1 })
    res.status(200).json({ results: results });

  } catch (err) {
    console.error("fetchChats", err);
  }
};

// ..................................ACCESSING MESSAGES OF A SINGLE-CHAT................................................
const accessMessage = async (req, res) => {
  try {
    const userId = req.payload.id
    const { recieverId } = req.params

    const reciever = await userModel.findById(recieverId)
    const existingChat = await communityChatModel.findOne({
      users: { $all: [userId, recieverId] },
    });

    if (existingChat) {
      const messages = await MessageModel.find({
        communityChat: existingChat._id,
      });
      console.log(messages)
      return res.status(200).json({ messages, reciever, chatId: existingChat });
    }

  } catch (err) {
    console.error('accessmessage', err)
  }
}

// ..........................................ADD-MESSAGE-ONE-TO-ONE.........................................................................
const addMessage = async (req, res) => {
  try {
    const { userId, message, chatId } = req.body;
    const newMessage = await MessageModel.create({
      sender: userId,
      message,
      communityChat: chatId
    });
    console.log(newMessage)
    if (newMessage) {
      res.status(200).json({ msg: newMessage, message: "message " });
    } else {
      res.status(403).json({ errmsg: "not ready" });
    }
  } catch (err) {
    console.error(err);
  }
};




// ..................................LISTING ALL USERS IN CHAT ACCORDING USER SEARCH.....................................
const allUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    // const keyword = req.body.keyword
    //   ? {
    //       $or: [
    //         { name: { $regex: req.body.keyword, $options: "i" } },
    //         { email: { $regex: req.body.keyword, $options: "i" } },
    //       ],
    //     }
    //   : {};

    const allUsers = await userModel.find({ _id: { $ne: userId } });
    return res.status(200).json({ allUsers: allUsers });
  } catch (err) {
    console.error("allUsers : ", err);
  }
};







// ..........................................ACCESS-Messages-OF-ONE-TO-ONE.............................................................
const accessChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reciever } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ errmsg: "userId param not sent with request" });
    }

    let isChat = await co.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: userId } } },
        { users: { $elemMatch: { $eq: reciever } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await userModel.populate(isChat, {
      path: "latestMessage.sender",
      select: "name profileImage email",
    });

    if (isChat.length > 0) {
      res.status(200).json(isChat[0]);
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [userId, reciever],
      };
      const createdChat = await ChatModel.create(chatData);
      const fullChat = await ChatModel.findOne({
        _id: createdChat._id,
      }).populate("users", "-password");

      res.status(200).json(fullChat);
    }
  } catch (err) {
    console.error("accessChat", err);
  }
};

// ..........................................FETCHING LOGGED USER CHATS................................................
const fetchChats = async (req, res) => {
  try {
    const { userId } = req.params;
    ChatModel.find({ users: { $elemMatch: { $eq: userId } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await userModel.populate(results, {
          path: "latestMessage.sender",
          select: "name profileImage email",
        });
        res.status(200).json(results);
      });
  } catch (err) {
    console.error("fetchChats", err);
  }
};

// .........................................CREATING-GROUP-CHAT-FOR-COMMUNITY............................................
const createCommunity = async (re, res) => {
  try {
    const { users, groupName } = rq.body;
    const { userId } = req.params;
    users.push(userId);

    const groupChat = await ChatModel.create({
      chatName: groupName,
      users: users,
      isGroupChat: true,
      groupAdmin: userId,
    });

    const fullGroupChat = await ChatModel.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (err) {
    console.error("createCommunity", err);
  }
};

// ..................................EDIT-COMMUNITY-ACCESS-ONLY-FOR-ADMIN..............................................
const editCommunity = async (req, res) => {
  try {
    const { chatId, groupName } = req.body;

    const updatedChat = await chatModel
      .findByIdAndUpdate(
        chatId,
        { $set: { chatName: groupName } },
        {
          new: true,
        }
      )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(403).json({ errmsg: "Edit community updated" });
    } else {
      res.status(200).json({ message: "changes updated successfully" });
    }
  } catch (err) {
    console.error("editCommunity");
  }
};

// ..........................................ADDING NEW MEMBER TO COMMUNITY...........................................
const addToCommunity = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const added = await chatModel.findByIdAndUpdate(
      { chatId },
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(403).json({ errmsg: "Failed to add new member" })
    } else {
      res.status(200).json({ message: "Added new member" })
    }
  } catch (err) {
    console.error("addToCommunity", err);
  }
};

//.............................................ADMIN REMOVE MEMBER FROM GROUP.......................................................

const removeFromCommunity = async (req, res) => {
  try {

    const { chatId, userId } = req.body;
    const removed = await chatModel.findByIdAndUpdate(
      { chatId },
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.status(403).json({ errmsg: "Failed to remove member" })
    } else {
      res.status(200).json({ message: "removed Successfully" })
    }
  } catch (err) {
    console.error('removeFromCommunity', err)
  }
}




module.exports = {
  updateUserinfo,
  userInfo,
  connectMembers,
  createChat,
  chatList,
  accessMessage,
  acceptReq,
  addMessage,



  allUsers,
  accessChat,
  fetchChats,
  createCommunity,
  editCommunity,
  addToCommunity,
  removeFromCommunity
};
