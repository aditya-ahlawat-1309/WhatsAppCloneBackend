
// import modules 
const mongoose = require("mongoose");


// define mongoose schema of the messages
const messageSchema = mongoose.Schema(
  {
    // ObjectId . A SchemaType is just a configuration object for Mongoose.
    // An instance of the mongoose. ObjectId SchemaType doesn't actually create MongoDB ObjectIds,
    // it is just a configuration for a path in a schema.

    // type: mongoose.Schema.Types.ObjectId ---------> is the path and ------->
    //ref: "User" means i have to look into the User Schema

    // (fetches the data from User Model UserSchema)
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // type: String and remove spaces (store as one simple long string)
    content: { type: String, trim: true },

    // refer to Chat fro the path
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },

    // multiple users will read the Chat hence, [] (array) and refer to "User"
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
  // store timestamps in the mongoDB
);

// store the messageSchema in Message
const Message = mongoose.model("Message", messageSchema);
// exports Message
module.exports = Message;
