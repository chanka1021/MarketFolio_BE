const Listing = require("../models/Listing");
const multer = require("multer");

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

module.exports = {
  createListing,
  getAllListings
};
