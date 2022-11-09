
// import modules
const jwt = require("jsonwebtoken");


// generateToken function 
const generateToken = (id) => {

  // sign in with jwt , encrypt the id with the expression process.env.JWT_SECRET
  return jwt.sign({ id }, process.env.JWT_SECRET, {

    // expires the token in 30d and login again
    expiresIn: "30d",
  });
};

// export the modules for everywhere use
module.exports = generateToken;
