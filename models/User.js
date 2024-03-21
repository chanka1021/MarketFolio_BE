const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const Listing = require("./Listing");

// Define User schema
const UserSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: Number, unique: true, required: true },
  city: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  favoriteListings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing"  }]
});

// Static method to create a new user
UserSchema.statics.createUser = async function (userData) {
  // Validation
  if (!userData.email || !userData.password) {
    throw new Error("All fields are required");
  }
  if (!validator.isAscii(userData.name)) {
    throw new Error("Name is not valid");
  }
  if (!validator.isEmail(userData.email)) {
    throw new Error("Invalid Email");
  }
  const exists = await this.findOne({ email: userData.email });
  if (exists) {
    throw new Error("User already exists");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  return this.create({ ...userData, password: hashedPassword });
};

// Static method to log in a user
UserSchema.statics.loginUser = async function (userData) {
  if (!userData.email || !userData.password) {
    throw new Error("All fields must be filled");
  }
  const user = await this.findOne({ email: userData.email });
  if (!user) {
    throw new Error("Incorrect email");
  }
  const match = await bcrypt.compare(userData.password, user.password);
  if (!match) {
    throw new Error("Incorrect password");
  }
  return user;
};

// Method to update user
UserSchema.statics.updateUser = async function(userId, userData) {
  // Validation
  if (!userId) {
    throw new Error("User ID is required");
  }
  if (!userData) {
    throw new Error("User data is required");
  }
  if (userData.password) {
    if (!userData.passwordOLD) {
      throw new Error("Old password is required to update the password");
    }
    const user = await this.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const match = await bcrypt.compare(userData.passwordOLD, user.password);
    if (!match) {
      throw new Error("Incorrect password");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    userData.password = hashedPassword;
    delete userData.passwordOLD;
  }
  // Update user data
  const updatedUser = await this.findByIdAndUpdate(userId, userData, { new: true });
  if (!updatedUser) {
    throw new Error("Failed to update user data");
  }
  return updatedUser;
};

//static methoded to add favorite listing
UserSchema.statics.addFavoriteListings = async function(userId, listingId) {
  // Validation
  if (!userId) {
    throw new Error("User ID is required");
  }
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }
  // Add favorite listings
  const user = await this.findByIdAndUpdate(userId, { $addToSet: { favoriteListings: listingId } }, { new: true });
  if (!user) {
    throw new Error("Failed to add favorite listings");
  }
  return user;
};

//static methoded to remove favorite listing
UserSchema.statics.removeFavoriteListings = async function(userId, listingId) {
  // Validation
  if (!userId) {
    throw new Error("User ID is required");
  }
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }
  // Remove favorite listing
  const user = await this.findByIdAndUpdate(userId, { $pull: { favoriteListings: listingId } }, { new: true });
  if (!user) {
    throw new Error("Failed to remove favorite listings");
  }
  return user;
};

module.exports = mongoose.model("User", UserSchema);
