// import modules 
const mongoose = require("mongoose");
const colors = require("colors");


// async function = connectDB
const connectDB = async () => {
  try {
    
    // connect to mongoose 
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      
      // ----------------- Always version@5 --------------//
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    // console.log if mongoDB is connected or not
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  
  } catch (error) {

    // console.log the error in red bold
    console.log(`Error: ${error.message}`.red.bold);
    
    // exit the process of connecting the mongoDB  
    process.exit();
  }
};

// export the modules for everywhere use
module.exports = connectDB;
