const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Function to create token
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
}

// Controller function to log in user
const loginUser = async (req, res) => {
  try {
    const user = await User.loginUser(req.body); // Login user
    const token = createToken(user._id); // Create token for user
    // Send response with user details and token
    res.header("auth-token", token).send({ 
      id : user._id,
      name : user.name,
      email: user.email,
      city: user.city,
      phone: user.phone,
      auth: true, 
      token: token 
    });
  } catch (err) {
    res.status(400).json({ error: err.message }); // Handle errors
  }
};

// Controller function to sign up user
const signupUser = async (req, res) => {
  try {
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      city: req.body.city,
      phone: req.body.phone,
    };
    const savedUser = await User.createUser(userData); // Create new user
    const token = createToken(savedUser._id); // Create token for new user
    // Send response with user details and token
    res.status(201).send({
      email: savedUser.email,
      name: savedUser.name,
      city: savedUser.city,
      phone: savedUser.phone,
      id : savedUser._id,
      token: token,
    })
  } catch (err) {
    res.status(400).json({ error: err.message }); // Handle errors
  }
};

// Controller function to update user
const updateUser = async (req, res) => {
  try {
    const user = await User.updateUser(req.params.id, req.body); // Update user
    if (!user) {
      return res.status(404).json({ error: 'No user found with this ID' }); // If user not found, return 404
    }
    res.status(200).json(user); // Send updated user details
  } catch (err) {
    res.status(400).json({ error: err.message }); // Handle errors
  }
}

// Export controller functions
module.exports = {
  loginUser,
  signupUser,
  updateUser
};
