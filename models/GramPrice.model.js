const mongoose = require("mongoose");

const gramPriceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["gold", "silver"],
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const GramPrice = mongoose.model("GramPrice", gramPriceSchema);

module.exports = GramPrice;
