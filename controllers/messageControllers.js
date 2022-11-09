
// import the modules
const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected

// send the messages information
const allMessages = asyncHandler(async (req, res) => {
  try {
    // find the messages according to the chatId ans
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email") // populate the variable with who is the sender and name, pic, email
      .populate("chat"); // && offcourse the entore chat
    res.json(messages); // send the entire messages response
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected

// if you want to send message
const sendMessage = asyncHandler(async (req, res) => {
  
  // fille the content and chatId variables
  const { content, chatId } = req.body;

  // if there is no content and chatId
  if (!content || !chatId) {
    // kuch nhi bhejna kya yaar ?
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  // nhi toh newMessage variable me
  var newMessage = {
    // sender ki info
    sender: req.user._id,
    // kya content hai
    content: content,
    // chat ki id
    chat: chatId,
  };

  try {

    // message create karo 
    var message = await Message.create(newMessage);
    // message ko populate karo with sender and name and pic info 
    message = await message.populate("sender", "name pic").execPopulate();
    // populate the message with chat 
    message = await message.populate("chat").execPopulate();
    // populate the User with {} and store in message 
    message = await User.populate(message, {
      // see messageModel ----> you have to follow that path
      path: "chat.users",
      // uss path me se name pic email select karo
      select: "name pic email",
    });

    // find the chatId and update the latest message
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    // send the response with message
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// exports the module
module.exports = { allMessages, sendMessage };
