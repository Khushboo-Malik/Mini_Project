const jwt=require("jsonwebtoken");
const jwtSecret=process.env.SECRET_KEY_JWT;

function setUser(user){
     
    return jwt.sign({
        username:user.username,
        email:user.email,
        role:user.role,
    },jwtSecret); 
};

function getUser(token){
    if(!token) {
        return null;
    }
    else{
      return jwt.verify(token,jwtSecret);
    }
}

module.exports={setUser,getUser};