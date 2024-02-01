const express = require("express");
const router = express.Router();

const handleUserSignup = require("../controllers/userController.js").handleUserSignup;
const verifyMail = require("../controllers/userController.js").verifyMail;
const handleUserLogin = require("../controllers/userController.js").handleUserLogin;

router.post("/signup",handleUserSignup);
router.get("/verifyEmail/:Email",verifyMail);
router.post("/login",handleUserLogin);

module.exports=router;