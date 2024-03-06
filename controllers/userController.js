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
    res.header("auth-token", token).send({ 
      id : user._id,
      name : user.name,
      email: user.email,
      city: user.city,
      phone: user.phone,
      auth: true, token: token });
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
      email: savedUser.email,
      name: savedUser.name,
      city: savedUser.city,
      phone: savedUser.phone,
      id : savedUser._id,
      token: token,
    })
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//update user 
const UpdateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'No user found with this ID' });
    }
    res.status(200).json(user);
  }
  catch (err) {
    res.status(400).json({ error: err.message });
  }
}
module.exports = {
  loginUser,
  signupUser,
  UpdateUser
};
