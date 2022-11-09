
// import modules from other folders
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public

// get all the Users you are searching
const allUsers = asyncHandler(async (req, res) => {

  // what is searched in the search bar is stored in the keyword
  const keyword = req.query.search
    ? {

      // regex and mongoDB query for searching the name and email and displaying both if matched with name $or if matched with email
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : 
    // if nothing found then display nothing
    {};

    // if user is found by keyword then find it's id
    
    // $ne selects the documents where the value of the field is not equal to the specified value. 
    // This includes documents that do not contain the field.
    
    // req.user._id is the user who is requesting data (seraching the other people) we are not supposed to get him
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

  // whatever the response is, send it
  res.send(users);
});



//@description     Register new user
//@route           POST /api/user/
//@access          Public

// 
const registerUser = asyncHandler(async (req, res) => {

  // put the requested body items in name , email, password, pic respectively
  const { name, email, password, pic } = req.body;


  // if name, email or password are not entered then return status code 400
  if (!name || !email || !password) {

    // send status code 400
    res.status(400);

    // throw an Error ("Please Enter all the Fields")
    throw new Error("Please Enter all the Feilds");
  }


// user Exists or not
  const userExists = await User.findOne({ email });

  // if yes, then 
  if (userExists) {
    // return status 400
    res.status(400);
    // and throw Error that "User already exists"
    throw new Error("User already exists");
  }


  // if Error is not Thrown then below code will be executed
  const user = await User.create({

    // user with the following fields will be created
    name,
    email,
    password,
    pic,
  });

  // if user is there and created then send the response with status code 201 and json data
  if (user) {
    res.status(201).json({

      // send the following fields
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      // generate token with the following id ----> user._id
      token: generateToken(user._id),
    });
  } 
  
  // nhi toh
  else {

    // send the status code 400
    res.status(400);

    // and throw an Error that User not found
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public

// if user is found then authenticate
const authUser = asyncHandler(async (req, res) => {
  
  // req.body  --------> values entered in email and password on the login Page
  const { email, password } = req.body;

  // find user with the following email and store in the -------> user variable
  const user = await User.findOne({ email });

  // if user is found password has matched
  if (user && (await user.matchPassword(password))) {

    // send the response with the following json data
    res.json({
      // send the following json data
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      // generate the following token
      token: generateToken(user._id),
    });
  } 
  // nhi toh
  else {
    // send the response with status code 401
    res.status(401);
    // and throw an Error ------> "Invalid Email or Password"
    throw new Error("Invalid Email or Password");
  }
});


// exports the following module
module.exports = { allUsers, registerUser, authUser };
