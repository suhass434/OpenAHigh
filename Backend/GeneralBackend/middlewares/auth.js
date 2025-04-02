const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../models/User");


//auth
exports.auth=async(req,res,next)=>{
  try{
    //extract token
   
    const token=req.cookies.token 
                || req.body.token 
                || req.header("Authorization").replace("Bearer ","");
   
    //if token missing,then return response
    if(!token){
      return res.status(401).json({
        success:false,
        message:"Token is missing"
      });
    }
    
    //verify token
    try{
      console.log("BEFORE VERIFIYINH");
      const decode= jwt.verify(token,process.env.JWT_SECRET);
      console.log(decode);
      console.log("HERE WE DECODED");
      req.user=decode;
    }
    catch(err){
      //issue
      console.log(err);
      console.log(err.message);
      return res.status(401).json({
        success:false,
        message:"Token is invalid"
      });
    }
    next();

  }catch(err){
    return res.status(401).json({
      success:false,
      message:"Something went wrong while validating the token",
    });
  }
}

