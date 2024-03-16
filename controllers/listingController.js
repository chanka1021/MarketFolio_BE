const Listing = require("../models/Listing");
const multer = require("multer");
const User = require('../models/User');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).array('photos', 5); // Change to array()

const createListing = async (req, res) => {
  try {
    // Handle file uploads using the upload middleware
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: "Multer error: " + err.message });
      } else if (err) {
        return res.status(400).json({ error: "Error uploading files: " + err.message });
      }

      // Files uploaded successfully, proceed with creating the listing
      const listingData = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        city: req.body.city,
        seller: req.body.seller,
        address: req.body.address,
        createdAt: Date.now(),
      };

      if (req.files && req.files.length > 0) {
        listingData.photos = req.files.map(file => file.path); // Use req.files to access uploaded files
      } else {
        listingData.photos = []; // Set images to an empty array if no images were uploaded
      }

      const listing = await Listing.create(listingData);
      res.send(listing);
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all listings from the database and return them
const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find();
    res.send(listings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// get 1 listing with user infos
const getOneListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const user = await User.findById(listing.seller);
    if (!user) {
      return res.status(404).json({ error: "Seller not found" });
    }

    const userInfo = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city
    };

    const listingObject = listing.toObject(); // Convert to plain JavaScript object
    listingObject.userInfo = userInfo;
    delete listingObject.seller; // Remove seller field

    console.log(listingObject);

    res.send(listingObject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
/// get listing with category/city/price filter 
const getFilteredListing = async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, status } = req.query; // Changed variable names to minPrice and maxPrice
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    if (city) {
      filter.city = city;
    }
    if (minPrice && maxPrice) { // Check if both minPrice and maxPrice are provided
      filter.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) }; // Ensure prices are parsed as integers
    } else if (minPrice) { // If only minPrice is provided
      filter.price = { $gte: parseInt(minPrice) };
    } else if (maxPrice) { // If only maxPrice is provided
      filter.price = { $lte: parseInt(maxPrice) };
    }
    if (status) {
      filter.status = status;
    }

    // Check if there are any filter conditions
    const filterKeys = Object.keys(filter);
    console.log("M : ", filter);
    const hasFilters = filterKeys.length > 0;

    // If there are filters, use them; otherwise, retrieve all listings
    const listings = hasFilters ? await Listing.find(filter) : await Listing.find();
    
    res.send(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get listings by userid 
const getListingByUserId = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.params.id });
    res.send(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createListing,
  getAllListings,
  getOneListing,
  getFilteredListing,
  getListingByUserId
};
