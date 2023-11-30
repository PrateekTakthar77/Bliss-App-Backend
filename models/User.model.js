const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    isEmailVerified: { type: Boolean, default: false },
    otp: {
      type: String,
      required: true,
      expires: "10m", // OTP expires after 10 minutes
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Dealer", "Customer", "Admin", "Salesperson"],
      required: true,
    },
    userDetails: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetails" },
    userCount: {
      type: Number,
      default: 1
    },
    // to disable and enable user 
    enable: {
      type: Boolean,
      default: true
    },
    resetToken: {
      type: String
    },
    resetTokenExpires: {
      type: Number
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
