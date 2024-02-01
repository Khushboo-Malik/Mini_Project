require("dotenv").config()
const User = require('../models/userModel.js');

const{setUser,getUser}=require("../middlewares/auth");
const{send_mail_registration,send_mail_verification,send_mail_OTP}=require("./mailController");
const jwt=require("jsonwebtoken");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const axios = require("axios");
const { integrations } = require("googleapis/build/src/apis/integrations/index.js");

async function handleUserSignup(req, res) {

    const body = req.body;
    /*const Response = req.body["g-recaptcha-response"];
    const secretkey = process.env.SECRET_KEY;
    const verify = `https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${Response}`;
    try {
        const response = await axios.post(verify);
        console.log("success:", response.data);
        if (!response.data.success) {
            res.json("Couldn't verify reCAPTCHA");
            return;
        }
    }
    catch (error) {
        console.log("error in captcha:", error);
        res.json("Error verifying reCAPTCHA");
        return;
    }*/
    const user = {
        username: body.username,
        email: body.email,
        password: body.password,
        role:body.role,
        emailVerified:"No",
    }
    console.log("user:",user);

    const result=await User.findOne({"email":user.email});
    if(result){
        return res.status(400).json("Email already exists");
    };

    if(!user.password){
        return res.status(400).json("Please enter password");
    }
    if(!user.email){
        return res.status(400).json("Please enter email");
    }
    if(!user.username){
        return res.status(400).json("Please enter name");
    }      
    if(!user.role){
        return res.status(400).json("Please enter your role");
    }   
    bcrypt.genSalt(saltRounds, (saltErr, salt) => {
        if (saltErr) {
            res.status(500).json("Internal server error");
        } else {

            bcrypt.hash(user.password, salt, async (hashErr, hash) => {
                if (hashErr) {
                    res.status(500).json("Internal server error");
                } else {

                    user.password = hash;
                    console.log("hashed password:",user.password);

                    try {
                        //console.log("URL:",process.env.URL);
                        //console.log("email:",user.email);
                        
                        const result = await User.create(user);
                        
                        send_mail_verification(user.email,process.env.URL);
                       
                        const obj={username: body.username,
                            email: body.email,
                            username:body.username,
                            role:body.role,
                            emailVerified:"No",
                        }
                        send_mail_registration(obj.email,obj.username);
                        
                        return res.json({message:"Details entered successfully",result:obj});
                    } catch (dbError) {
                        res.status(500).json("Internal server error");
                        console.log(dbError);
                    }
                }
            });
        }
    });
};

async function verifyMail(req,res){
    try{
        const{Email}=req.params;
        const userVerify=await User.findOne({"email":Email});
        if(!userVerify){
            return res.status(400).json("User with such email ID not found");
        }
        userVerify.emailVerified="Yes";
        await userVerify.save();
        return res.json("Email verified successfully");

    }catch(error){
        console.log(error);
        return res.status(500).json({msg:"Internal server error"});
    }
  }

  async function handleUserLogin(req,res){
    try{
    const body=req.body;
    const email=body.email;
    const password=body.password;
        
    if(!password){
        return res.status(400).json("Please enter password");
    }

    if(!email){
        return res.status(400).json("Please enter email");
    }
    
        const user = await User.findOne({ "email":email });    

        const is_mail_verified=user.emailVerified;
        if(is_mail_verified==="No"){
            return res.status(400).json("Email not verified");
        }

        console.log("user:",user);
        if (!user){
            
        return res.status(400).json("No such user found")}//or redirect to signup

        const Password=user.password;

        const isPasswordValid = await bcrypt.compare(password, Password);
        if (isPasswordValid) {
            user.isLoggedIn="Yes";
            user.save();
            const token = setUser(user);
            
            return res.json({msg:"Login successfull",token:token}); 
            
        } else {
            res.status(401).json("Incorrect Password");
        }
    }catch (error) {
        console.error(error);
        res.status(500).json("Internal server error");
    }
}


  module.exports={handleUserSignup,verifyMail,handleUserLogin}

