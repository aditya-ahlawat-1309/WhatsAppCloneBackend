
// import modules
const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected

// access to Chats
const accessChat = asyncHandler(async (req, res) => {
  
  // store req.body information in userId
  const { userId } = req.body;

  // if no information then consol.log and return status
  if (!userId) {
    
    // console.log( "UserId param not sent with request" )
    console.log("UserId param not sent with request");

    // return response status with code 400
    return res.sendStatus(400);
  }


  // if it is a chat or groupChat
  var isChat = await Chat.find({

    // if it is a chat then find first if isGroupChat variable is false or not
    isGroupChat: false,

    // req.user._id (jisne bheji hai) $and userId (jisko bheji hai) woh match kar rahe ya nhi 
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password") // if matching then populate (fill up) the fields with users without password
    .populate("latestMessage"); // and fill up the fields with latest message


// if it is a chat then populate the User with -------- 
// ------------------ (if it isChat == true ------->  sender of latestMessage and name pic and email of sender)
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  // if it is (chat) has length more than zero then (since we have trimmed spaces) we send response isChat[0];
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {

      // and make the chatName = equal = to "sender"
      chatName: "sender",

      // make isGroupChat as false
      isGroupChat: false,

      // users in the one to one chat bhejne wala -----> req.user._id ----- $and ----- (jisko bheja) userId <-------------
      users: [req.user._id, userId],
    };

    try {

      // line 55 ----> create a Chat and store the details in createdChat
      const createdChat = await Chat.create(chatData);

      // Chat.findOne({_id (id serached) : (===) createdChat._id ( the id of the created chat)}) -----> match hore toh -------->
      // ----------> unko populate karo with ---- "users" ---- $and ----- exclude password (hance, "-"password )  
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      // send the response with status code 200 with json data Full Chat
      res.status(200).json(FullChat);
    
    
    } 
    // if there is an error
    catch (error) {
      //  send the response status with code 400
      res.status(400);
      // and give the error with error.message -----> "message inside the error"
      throw new Error(error.message);
    }
  }
});



//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected

// fetch chats or show error
const fetchChats = asyncHandler(async (req, res) => {
  try {
    // find the chat sent by someone and see if it matches with the user._id (kisi ne bheji bhi hai)
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password") // if yes then store users (bhejne wala) without password
      .populate("groupAdmin", "-password") // groupAdmin hai bhi ya nhi
      .populate("latestMessage") // latest Message kya hai
      .sort({ updatedAt: -1 }) // latest message sabe pehle
      .then(async (results) => { // yeh sab hone ke baad
        results = await User.populate(results, { 
          // results me latest Message ko bhejne wala
          path: "latestMessage.sender",
          // uska name, pic, email bhi store karo
          select: "name pic email",
        });
        // upar wali saari feilds jo populate kari unko send kardo aur status code will be 200
        res.status(200).send(results);
      });
  } 
  // nhi toh agar koi error hai
  catch (error) {
    // response bhejo 400
    res.status(400);
    // aur error bhi bhej do
    throw new Error(error.message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected

// agar groupChat create karni ho toh
const createGroupChat = asyncHandler(async (req, res) => {

  // agar kon kon se users add karne hai ----> req.body.users && aur group ka naam ----> req.body.name ----> filled nhi hai toh ---->
  if (!req.body.users || !req.body.name) {
    // response bhejo 400 aur ek message bhejo ki saari fields fill karo
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  // JSON string to JSON Object ------> req.body.users ----> kitne users add kiye
  var users = JSON.parse(req.body.users);

  // if less than two users are added 
  if (users.length < 2) {
    
    // return status 200 and send the response ("More than 2 users are required to form a group chat")
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  // nhi toh users variable me admin ko daalo (group create karne wala)
  users.push(req.user);

  try {

    // Chat create karo agar yaha tak pahuch gaye aur saari information ko groupChat variable me store karlo
    const groupChat = await Chat.create({
      // chat ka naam
      chatName: req.body.name,
      // konse users hai group me
      users: users,
      // group chat ko karo true
      isGroupChat: true,
      // see line 155 (group create karne wala)
      groupAdmin: req.user,
    });

    // jo groupChat create ki uski id find karo
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password") // usme users ki info daalo except password
      .populate("groupAdmin", "-password"); // groupAdmin ki indo except password

      // uss groupChat ki info bhej do in json fromat
    res.status(200).json(fullGroupChat);
  } 
  // if there is an error
  catch (error) {
    // send a response 400
    res.status(400);

    // and throw new Error with the message of the error
    throw new Error(error.message);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected

// if you want to rename the group
const renameGroup = asyncHandler(async (req, res) => {
  
  // get the chatId and chatName 
  const { chatId, chatName } = req.body;

  // find the id of the chat and update it and store the info in the update chat
  const updatedChat = await Chat.findByIdAndUpdate(
    // update chatId, chatName, new:true (something is updated)
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password") // populate the fields of users without password
    .populate("groupAdmin", "-password"); // populate the fields groupAdmin without password


    // if nothing is found
  if (!updatedChat) {
    // return response 404
    res.status(404);
    // throw new Error that Chat Not Found
    throw new Error("Chat Not Found");
  } else {
    // nhi toh send the response of the updatedChat
    res.json(updatedChat);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected

// if you want to remove someone from group
const removeFromGroup = asyncHandler(async (req, res) => {
  
  // get the chatId and userId
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const removed = await Chat.findByIdAndUpdate(
    
    // find the chat id and pull the user and new: true i.e. there is some updation
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password") // populate the fields with users and not password
    .populate("groupAdmin", "-password"); // and groupAdmin and not password

    // if nothing is there in removed (it's empty)
  if (!removed) {
    // return reposnse 404
    res.status(404);
    // throw an Error ----> Chat Not Found
    throw new Error("Chat Not Found");
  } else {
    // send the response who is removed
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected

// if you want to add something to Group
const addToGroup = asyncHandler(async (req, res) => {
  
  // get the chatId and userId (jisko add karna hai)
  const { chatId, userId } = req.body;

  // check if the requester is admin
  const added = await Chat.findByIdAndUpdate(
    // get the chatId and push the users with their userId and since something is updated new:true
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password") // populate users info without password
    .populate("groupAdmin", "-password"); // populate groupAdmin without password


    // if nothing is added
  if (!added) {
    // return response with status 404
    res.status(404);
    // throw new Error ("Chat Not Found")
    throw new Error("Chat Not Found");
  } else {
    // if something is added then send the json response ----> added
    res.json(added);
  }
});

// exports all the modules
module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
