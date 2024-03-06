const express = require("express");
const router = express.Router();

// controller functions
const { signupUser, loginUser , UpdateUser} = require("../controllers/userController");

// login route
router.post("/login", loginUser);
// signup route
router.post("/signup", signupUser )
// update route 
router.put('/update/:id', UpdateUser);
module.exports = router;
