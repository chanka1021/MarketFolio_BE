const mongoose = require("mongoose");
const UserSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  address: String,
  phone: Number,
});

module.exports = mongoose.model("User", UserSchema);
