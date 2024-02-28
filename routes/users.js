const express = require("express");
const router = express.Router();
const User = require("../models/User");

// controller functions
const { signupUser, loginUser } = require("../controllers/userController");

// login route
router.post("/login", loginUser);

// signup route
router.post("/signup", signupUser )

router.get("/test", async (req, res) => {

  res.json({ msg: "users route" });
})

/* router.post("/signup", async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    address: req.body.address,
    phone: req.body.phone,
  });
  try {
    const savedUser = await user.save();
    res.json(savedUser);
  } catch (err) {
    res.json({ error: err });
  }
}); */

module.exports = router;
