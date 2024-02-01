const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:false,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        unique:false,
    },
    role:{
        type:String,
        enum:["Chef","Customer"],
        default:"Customer",
        required:false,
        unique:false,
    },
    otp:{
        type: String,
        required: false,
        default: 0,
      },
    emailVerified:{
        type:String,
        required:false,
        enum:["Yes","No"],
        default:"No",
      },
    
});

const User = mongoose.model('User', userSchema);

module.exports = User;
