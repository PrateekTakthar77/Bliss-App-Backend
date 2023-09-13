const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    address: {
      addressLine: String,
      pincode: String,
      city: String,
      area: String,
      country: String,
      state: String,
    },
    timeCreated: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "cancelled", "accepted", "delivered"],
      default: "pending",
    },
    total: {
      type: Number,
      default: 0,
    },
    orderId: {
      type: String,
      required: true,
      // default: " For OrderId refers to this order _ID",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.virtual("totalOrderValue").get(function () {
  let totalValue = 0;

  for (const item of this.items) {
    totalValue += parseInt(item.product.price) * parseInt(item.quantity);
  }

  return totalValue;
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
