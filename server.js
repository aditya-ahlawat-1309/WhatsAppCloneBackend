// require modules
const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

// to use dotenv files
dotenv.config();

// to connect to database
connectDB();

// express.use() becomes app.use()
const app = express();

// to accept json data
app.use(express.json()); 


///////////////////////////////////////////////////////////////////////////////

//Cors Configuration - Start
// always use this to remove CORS Error

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
//Cors Configuration - End

//////////////////////////////////////////////////////////////////////////////////

// app.get("/", (req, res) => {
//   res.send("API Running!");
// });


// function is userRoutes and path is /api/user
app.use("/api/user", userRoutes);

// function is charRoutes and path is /api/chat
app.use("/api/chat", chatRoutes);

//function is messageRoutes and path is /api/message
app.use("/api/message", messageRoutes);





// --------------------------deployment------------------------------

// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/client/build")));

//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"))
//   );
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }

// --------------------------deployment------------------------------





// Error Handling middlewares
// if any error occurs then these are thrown up
app.use(notFound);
app.use(errorHandler);


// get PORT value from dotenv (process.env.PORT) and if that is not available then PORT = 5000
const PORT = process.env.PORT || 5000;


// run server and listen everything on PORT Number - here (PORT = 5000)
// consoles.log the PORT number
const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

// At a given interval (the pingInterval value sent in the handshake) the server sends a PING packet 
// and the client has a few seconds (the pingTimeout value) to send a PONG packet back. 
// If the server does not receive a PONG packet back, it will consider that the connection is closed

// origin:"*" means listen from every source no matter what  = (earlier https:localhost:3000 (will listen only from localhost 3000) )
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: '*',
  },
});



// connect socket.io and turn it on
io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // join chat and console.log the room name
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // if typing then emit the packet that the person is typing
  socket.on("typing", (room) => socket.in(room).emit("typing"));

  // if stops typing then emit the packet that the person has stopped typing
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // if message recieved (new packet with some info) then put it in chat
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    // if user is not defined then console.log
    if (!chat.users) return console.log("chat.users not defined");

    // if id matches with the sender id then return the message and emit the packet that the message has received
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      // receive the emit that message has been received
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  // if socket is off then console and leave
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
