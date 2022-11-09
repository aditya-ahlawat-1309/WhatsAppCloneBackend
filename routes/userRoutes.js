// import express and other modules
const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

// router().get().post() syntax can be used 
const router = express.Router();

// ----------------------> /api/user (see server.js first)
router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);

// ("/") means ----------> /api/user from server.js and /login from here ------> which means ------> /api/user/login
router.post("/login", authUser);

// exports router as it is router.route -----------> router is the function
module.exports = router;
