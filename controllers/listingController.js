// Required modules and environment variables
const Listing = require("../models/Listing"); // Importing Listing model
const multer = require("multer"); // Multer for handling file uploads
const User = require('../models/User'); // Importing User model
require('dotenv').config(); // Loading environment variables
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner"); // AWS S3 SDK for generating signed URLs
const { S3Client, GetObjectCommand , PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3"); // AWS S3 SDK for interacting with S3

// Environment variables for AWS S3
const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;

// Initializing S3 client
const s3 = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY
  },
  region: BUCKET_REGION
});
// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('photos', 5);

// Function to generate random image names
const randomImageName = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Controller function to create a new listing
const createListing = async (req, res) => {

  try {
    // Handling file uploads using the upload middleware
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: "Multer error: " + err.message });
      } else if (err) {
        return res.status(400).json({ error: "Error uploading files: " + err.message });
      }
      const imageNames = []; // Array to store image names
      for (const file of req.files) {
        const ImageName = randomImageName(); // Generate a random image name
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: ImageName,
          Body: file.buffer,
          ContentType: file.mimetype
        });
        await s3.send(command); // Upload image to S3
        imageNames.push(ImageName); // Push each image name to the array
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
        photos: imageNames // Use the array of image names
      };
      const listing = await Listing.create(listingData); // Create new listing in the database
      res.send(listing); // Send the created listing as response
    });
  } catch (err) {
    res.status(400).json({ error: err.message }); // Handle errors
  }
};

// Controller function to get all listings from the database
const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find(); // Retrieve all listings
    // Generate signed URLs for listing photos
    for (const listing of listings) {
      const photoUrls = [];
      for (const photoName of listing.photos) {
        const getObjParams = {
          Bucket: BUCKET_NAME,
          Key: photoName
        };
        const command = new GetObjectCommand(getObjParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        photoUrls.push(url);
      }
      listing.photos = photoUrls; // Replace photo names with signed URLs
    }
    res.send(listings); // Send the listings with signed photo URLs
  } catch (err) {
    res.status(400).json({ error: err.message }); // Handle errors
  }
};

// Controller function to get a single listing with user information
const getOneListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id); // Find the listing by ID
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" }); // If listing not found, return 404
    }

    // Generate signed URLs for listing photos
    const photoUrls = [];
    for (const photoName of listing.photos) {
      const getObjParams = {
        Bucket: BUCKET_NAME,
        Key: photoName
      };
      const command = new GetObjectCommand(getObjParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      photoUrls.push(url);
    }
    listing.photos = photoUrls; // Replace photo names with signed URLs

    // Get user information associated with the listing's seller
    const user = await User.findById(listing.seller);
    if (!user) {
      return res.status(404).json({ error: "Seller not found" }); // If seller not found, return 404
    }

    // Construct user info object
    const userInfo = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city
    };
    
    const listingObject = listing.toObject(); // Convert listing to plain JavaScript object
    listingObject.userInfo = userInfo; // Add user info to listing object
    delete listingObject.seller; // Remove seller field from listing object

    res.send(listingObject); // Send the listing with user information
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle errors
  }
};

// Controller function to get filtered listings based on category, city, price, and status
const getFilteredListing = async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, status } = req.query; // Get filter parameters from request query
    let filter = {}; // Initialize filter object
    
    // Add filter conditions if parameters are provided
    if (category) filter.category = category;
    if (city) filter.city = city;
    if (minPrice && maxPrice) filter.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
    else if (minPrice) filter.price = { $gte: parseInt(minPrice) };
    else if (maxPrice) filter.price = { $lte: parseInt(maxPrice) };
    if (status) filter.status = status;

    // Retrieve filtered listings from the database
    const filterKeys = Object.keys(filter);
    const hasFilters = filterKeys.length > 0;
    const listings = hasFilters ? await Listing.find(filter) : await Listing.find();

    // Generate signed URLs for listing photos
    for (const listing of listings) {
      const photoUrls = [];
      for (const photoName of listing.photos) {
        const getObjParams = {
          Bucket: BUCKET_NAME,
          Key: photoName
        };
        const command = new GetObjectCommand(getObjParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        photoUrls.push(url);
      }
      listing.photos = photoUrls; // Replace photo names with signed URLs
    }
    res.send(listings); // Send the filtered listings with signed photo URLs
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle errors
  }
};

// Controller function to get listings by user ID
const getListingByUserId = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.params.id }); // Find listings by seller ID
    // Generate signed URLs for listing photos
    for (const listing of listings) {
      const photoUrls = [];
      for (const photoName of listing.photos) {
        const getObjParams = {
          Bucket: BUCKET_NAME,
          Key: photoName
        };
        const command = new GetObjectCommand(getObjParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        photoUrls.push(url);
      }
      listing.photos = photoUrls; // Replace photo names with signed URLs
    }
    res.send(listings); // Send the listings with signed photo URLs
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle errors
  }
};

// Controller function to delete a listing
// Controller function to delete a listing
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id); // Find the listing by ID
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" }); // If listing not found, return 404
    }

    // Check if the user is authorized to delete the listing
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You are not the owner of this listing" });
    }

    // Delete the listing from the database
    await listing.remove();

    // Delete associated images from S3
    const images = listing.photos;
    for (const image of images) {
      const deleteParams = {
        Bucket: BUCKET_NAME,
        Key: image
      };
      const command = new DeleteObjectCommand(deleteParams);
      await s3.send(command);
    }

    res.send(listing); // Send the deleted listing
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle errors
  }
};


// Controller function to update a listing
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id); // Find the listing by ID
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" }); // If listing not found, return 404
    }

    // Check if the user is authorized to update the listing
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized: You are not the owner of this listing" });
    }

    // Update the listing in the database
    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.send(updatedListing); // Send the updated listing
  } catch (err) {
    res.status(500).json({ error: err.message }); // Handle errors
  }
};

// Controller function to toggle  status (active/hidden)


// Export controller functions
module.exports = {
  createListing,
  getAllListings,
  getOneListing,
  getFilteredListing,
  getListingByUserId,
  deleteListing,
  updateListing
};
