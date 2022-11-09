
// import third-party modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


// userSchema = how the user will be stored in the database
const userSchema = mongoose.Schema(
  {

    // name is type of String and it is required
    name: { type: "String", required: true },

    // email is type of String and it is required and it should be unique
    email: { type: "String", unique: true, required: true },

    // password is of type String and it is required
    password: { type: "String", required: true },

    // pic is of type String and it is required but default will be (according to link given)
    pic: {
      type: "String",
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },

    // isAdmin or not = default false (the person is not) & required = true
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestaps: true }
  // timestamps is true as there will be time when the user registered

);

// match the two passwords entered and stored on login and send to bcyrpt for comparing
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// if password is modified (on first registration it will be modified) then head to step->2
userSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }

  // use genSalt -> (encryption level) upto 10 (higher the better) and store the salt encryption level in salt
  const salt = await bcrypt.genSalt(10);

  // hash up the entered password according to salting (salt)
  this.password = await bcrypt.hash(this.password, salt);
});


// define the mongoose model (UserSchema) as User
const User = mongoose.model("User", userSchema);


// exports the module User for further use wherever you want
module.exports = User;
