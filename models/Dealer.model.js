// dealer.js
const mongoose = require("mongoose");

const DealerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  salespersons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salesperson",
    },
  ],
  totalRevenue: {
    type: Number,
    default: 0,
  },
  totalCommission: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Dealer = mongoose.model("Dealer", DealerSchema);

module.exports = Dealer;
