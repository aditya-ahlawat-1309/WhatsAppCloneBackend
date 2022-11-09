// import third-party modules
const mongoose = require("mongoose");


// make a mongoose schema chatModel
const chatModel = mongoose.Schema(
  {
    // chatName should be of type String and trim the spaces (remove the spaces)
    chatName: { type: String, trim: true },

    // it is a group chat = true or false , default = false
    isGroupChat: { type: Boolean, default: false },

    // // ObjectId . A SchemaType is just a configuration object for Mongoose.
    // An instance of the mongoose. ObjectId SchemaType doesn't actually create MongoDB ObjectIds,
    // it is just a configuration for a path in a schema.

    //// type: mongoose.Schema.Types.ObjectId ---------> is the path and ------->
    //ref: "User" means i have to look into the User Schema
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ref: "Message"
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    // groupAdmin or not (fetches the data from User Model UserSchema)
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
// timestamp (when something happened)

);


// store the chatModel in Chat
const Chat = mongoose.model("Chat", chatModel);

// exports the Chat for everywhere use
module.exports = Chat;
