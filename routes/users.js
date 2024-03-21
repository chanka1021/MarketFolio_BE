const express = require("express");
const router = express.Router();
const auth = require("../middleware/requireAuth");

// controller functions
const { signupUser, loginUser , updateUser , addFavoriteListings , removeFavoriteListings} = require("../controllers/userController");

// login route
router.post("/login", loginUser);
// signup route
router.post("/signup", signupUser )
// update route 
router.put('/update/:id', updateUser);
//add fav listing 
router.put('/addfav', auth, addFavoriteListings);
//remove fav listing
router.put('/removefav', auth, removeFavoriteListings);
module.exports = router;
