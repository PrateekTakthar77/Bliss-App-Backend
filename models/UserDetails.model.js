const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  brandName: { type: String },
  address: { type: String },
  pincode: { type: String },
  city: { type: String },
  state: { type: String },
  locality: { type: String },
  gstNo: { type: String },
  storePersonName: { type: String },
  contactNo: { type: String, required: true, unique: true },
  gpsLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
});

const UserDetails = mongoose.model("UserDetails", userDetailsSchema);

module.exports = UserDetails;
