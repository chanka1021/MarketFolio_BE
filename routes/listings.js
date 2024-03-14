const express = require("express");
const router = express.Router();

// controller functions
const { createListing, getAllListings } = require("../controllers/listingController");


// get all listings route
router.get("/", getAllListings);
// create listing route
router.post("/create", createListing);
module.exports = router;