const User = require("../models/User");
const jwt = require("jsonwebtoken");

//create token FUNCTION
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
}



// login user
const loginUser = async (req, res) => {
  try{
    const user = await User.loginUser(req.body);
    var token = createToken(user._id);
    res.header("auth-token", token).send({ auth: true, token: token });
  }
  catch(err){
    res.status(400).json({ error: err.message });
  }

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
    //return json web token with the id of the user created
    const token = createToken(savedUser._id);
    res.status(201).send({
      user: savedUser,
      token: token,
    })
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


module.exports = {
  loginUser,
  signupUser,
};
