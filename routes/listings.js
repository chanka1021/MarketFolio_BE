const express = require("express");
const router = express.Router();

// controller functions
const { createListing, getAllListings ,getOneListing,getFilteredListing ,getListingByUserId} = require("../controllers/listingController");


// get all listings route
router.get("/", getAllListings);
// create listing route
router.post("/create", createListing);
// get listing & user info with id
router.get("/one/:id", getOneListing);
// get listing with category/city/price filter
router.get('/filter', getFilteredListing)
// get listings by userid
router.get('/user/:id', getListingByUserId)
module.exports = router;