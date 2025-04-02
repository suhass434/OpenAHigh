const express=require("express");
const app=express();
require("mongoose")



//Routes import
const userRoutes=require("./routes/User");


//Connection
const database=require("./config/database");
const cookieParser=require("cookie-parser");
const cors=require("cors");
const {cloudinaryConnect}=require("./config/cloudinary");
const fileUpload=require("express-fileupload");
const dotenv=require("dotenv");
//load all the config into dotenv instance
dotenv.config();

//PORT NO
const PORT=process.env.PORT || 4000;

//databaseconnect
database.connect();

//cloudinary connection
cloudinaryConnect();

//Middleware

//To parse json
app.use(express.json());

//To parse cookie
app.use(cookieParser());

//To allow backend to entertain req from frontend
app.use(
  cors({
    //frontend url
    origin:"*",
    credentials:true,
  })
);

app.use(
  fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp",
  })
);


//Mounting routes
app.use("/api/v1/auth",userRoutes);



//default route
app.get("/",(req,res)=>{
  return res.json({
    success:true,
    message:"Your server is up and running",
  })
})


//Activate server
app.listen(PORT,()=>{
  console.log(`App is running at ${PORT}`)
})