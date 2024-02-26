const User = require("../models/User");

// login user
const loginUser = async (req, res) => {
  res.json({ msg: "login user" });
};

//// signup user
const signupUser = async (req, res) => {
  try {
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      city: req.body.city,
      phone: req.body.phone,
    };
    const savedUser = await User.createUser(userData);

    res.status(200).json(savedUser.email);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


module.exports = {
  loginUser,
  signupUser,
};
