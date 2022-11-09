// import modules
const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

// use express.Router() for router.route().post().get() syntax
const router = express.Router();


///////--------------------------------------------------------------------------------///////////////////

//------protect -> first authentication and then accessChat, fetchChats, createGroupChats...... functionatlity will be allowed ----//

//// ----------------------------------------------------------------------------------///////////////////


// api/chat/ ---------> (see server.js)
router.route("/").post(protect, accessChat);
// api/chat/
router.route("/").get(protect, fetchChats);
// api/chat/group/
router.route("/group").post(protect, createGroupChat);
// api/chat/rename/
router.route("/rename").put(protect, renameGroup);
// api/chat/groupremove/
router.route("/groupremove").put(protect, removeFromGroup);
// api/chat/groupadd
router.route("/groupadd").put(protect, addToGroup);

////// --------------------------------------------------------------------------------////////////////////


// exports the modules 
module.exports = router;
