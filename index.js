const express =require("express")
const cors=require("cors");
const mongoose=require("mongoose");
const userRoutes=require("./routes/userRoutes");
const messageRoute=require("./routes/messagesroute");
const app=express();
const socket=require("socket.io");
require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use("/api/auth",userRoutes);
app.use("/api/message",messageRoute);
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log("MongoDB connection succesful");
}).catch((err)=>
{
    console.log(err.message);
})

const server=app.listen(process.env.PORT,()=>{
    console.log("SERVER started on port 5000");
})

const io=socket(server,{
    cors:{
        origin:process.env.ORIGIN,
        credential:true,
    }
});
global.onlineUsers=new Map();

io.on("connection",(socket)=>{
  global.chatsocket=socket;
  socket.on("add-user",(userId)=>{
    onlineUsers.set(userId,socket.id);
  });
  socket.on("send-msg",(data)=>{
    const sendUserSocket=onlineUsers.get(data.to)
    if(sendUserSocket){
        socket.to(sendUserSocket).emit("msg-recieve",data.messages);
    }
  });
});
