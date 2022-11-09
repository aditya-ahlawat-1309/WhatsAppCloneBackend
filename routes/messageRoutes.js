// import the modules
const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");


// use express.Router function for router.route().get().post()
const router = express.Router();

// --------> /:chatId is dynamic ---------> first protect (authentication is necessary and then allMessages will be passed)
router.route("/:chatId").get(protect, allMessages);
// --------> post the messages --------> first authentication and then send the Message (first logged in and then send the message)
router.route("/").post(protect, sendMessage);


// exports the modules
module.exports = router;
