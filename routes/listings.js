const express = require("express");
const router = express.Router();
const auth = require("../middleware/requireAuth");
// controller functions
const { createListing, getAllListings ,getOneListing,getFilteredListing ,getListingByUserId , deleteListing,updateListing,getFavListings} = require("../controllers/listingController");


// get all listings route
router.get("/", getAllListings);
// create listing route with authentication middleware
router.post("/create", auth, createListing);
// get listing & user info with id
router.get("/one/:id", getOneListing);
// get listing with category/city/price filter
router.get('/filter', getFilteredListing)
// get listings by userid
router.get('/user/:id', getListingByUserId)
// delete listing with authentication middleware
router.delete("/delete/:id", auth, deleteListing);
// update listing with authentication middleware
router.put('/update/:id', auth, updateListing);
// get fav listing of user with authentication middleware
router.get('/fav/:id', auth, getFavListings);
module.exports = router;
