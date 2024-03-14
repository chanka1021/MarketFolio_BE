const mongoose = require("mongoose");

const ListingSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category : {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
   photos: {
    type: [String],
    required: true,
  }, 
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  address : {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ListingSchema.statics.createListing = async function (listingData) {
  const listing = await this.create(listingData);
  return listing;
}

module.exports = mongoose.model("Listing", ListingSchema);
