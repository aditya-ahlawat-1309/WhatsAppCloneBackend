
// import the modules
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

// name an asyncHandler function = as = protect
const protect = asyncHandler(async (req, res, next) => {
  
  // let a variable  = token
  let token;


  // like in POSTMAN take headers = authorization and autorization which starts with ("Bearer") (Bearer Token)
  // automatically verifies the authorization token and authorization token which starts with ("Bearer")

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {

      // put the split value of authorization in token
      token = req.headers.authorization.split(" ")[1];

      // decodes token id with the help of JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // req.user is equal to the User.findById( find user by id whose id is equal to decoded.id) 
      // and get everything except password hence ("-password") = "-" is ther
      req.user = await User.findById(decoded.id).select("-password");

      //goes to next function hence next() since it is a middleware
      next();
    } catch (error) {

      // if there is an error then send status code 401
      res.status(401);

      // and throw new error that token is not authorized 
      throw new Error("Not authorized, token failed");
    }
  }

  // if no token is found
  if (!token) {

    // return status code 401
    res.status(401);

    // and throw new Error that there is no token
    throw new Error("Not authorized, no token");
  }
});


// exports the function protect for everyehere use
module.exports = { protect };
