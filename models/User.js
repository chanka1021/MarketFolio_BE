const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

// Define User schema
const UserSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: Number, unique: true, required: true },
  city: { type: String, required: true }
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

module.exports = mongoose.model("User", UserSchema);
