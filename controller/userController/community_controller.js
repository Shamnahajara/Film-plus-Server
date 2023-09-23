const chatModel = require("../../models/chatModel");
const ChatModel = require("../../models/chatModel");
const userModel = require("../../models/userModel");

// ...............................................USER-INFO...........................................................................
const userInfo = async (req,res)=>{
  try{
    const {userId} = req.params
    const user = await userModel.findOne({_id:userId})
    res.status(200).json({user:user});
  }catch (err){
    console.error(userInfo)
  }
}
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
    return res.status(200).json({allUsers:allUsers});
  } catch (err) {
    console.error("allUsers : ", err);
  }
};

// ..........................................ACCESS-CHAT-OF-ONE-TO-ONE.............................................................
const accessChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reciever } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ errmsg: "userId param not sent with request" });
    }

    let isChat = await ChatModel.find({
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

    if(!added){
        res.status(403).json({errmsg:"Failed to add new member"})
      }else{
        res.status(200).json({message:"Added new member"})
      }
  } catch (err) {
    console.error("addToCommunity", err);
  }
};

//.............................................ADMIN REMOVE MEMBER FROM GROUP.......................................................

const removeFromCommunity = async (req,res)=>{
    try{

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
    
        if(!removed){
            res.status(403).json({errmsg:"Failed to remove member"})
          }else{
            res.status(200).json({message:"removed Successfully"})
          }
    }catch (err){
        console.error('removeFromCommunity',err)
    }
}




module.exports = {
  userInfo,
  allUsers,
  accessChat,
  fetchChats,
  createCommunity,
  editCommunity,
  addToCommunity,
  removeFromCommunity
};
