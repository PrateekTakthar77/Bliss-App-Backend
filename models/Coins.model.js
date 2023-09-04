const mongoose = require("mongoose");

const coinPriceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["gold", "silver"],
  },
  weights: [
    {
      weight: {
        type: Number,
      },
      makingCharges: {
        type: Number,
      },
      status: {
        type: Boolean,
        required: true,
      },
      gst: {
        type: Number,
        required: true,
      }
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const CoinPriceModel = mongoose.model("CoinPrice", coinPriceSchema);

module.exports = CoinPriceModel;
