const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const UserSchema = mongoose.Schema({
  name: { type: String, required: true }, // String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // String,
  phone: { type: Number, unique: true, required: true },
  city: { type: String, required: true }, // String,
});

//static method to create User
UserSchema.statics.createUser = async function (userData) {

  //validation
  if(!userData.email || !userData.password) { throw new Error("All fields are required"); }
  if (!validator.isAscii(userData.name)) { throw new Error("Name is not valid"); }
  if (!validator.isEmail(userData.email)) { throw new Error("Invalid Email"); }
  const exists = await this.findOne({ email: userData.email });
  if (exists) { throw new Error("User already exists"); }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  return this.create({ ...userData, password: hashedPassword });
};
//static method to login User
UserSchema.statics.loginUser = async function (userData) {
  if(!userData.email || !userData.password) { throw new Error("All fields must be filled"); }
  const user = await this.findOne({ email: userData.email });
  if (!user) { throw new Error("Incorrect email"); }
  const match = await bcrypt.compare(userData.password, user.password);
  if (!match) { throw new Error("Incorrect password"); }
  return user;
};
module.exports = mongoose.model("User", UserSchema);
