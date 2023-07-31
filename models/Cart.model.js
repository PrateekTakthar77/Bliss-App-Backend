const mongoose = require("mongoose");
const { Product } = require("./Product");

const cartSchema = new mongoose.Schema({
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
  total: {
    type: Number,
    default: 0,
  },
});

cartSchema.methods.calculateTotal = async function () {
  let total = 0;
  for (const item of this.items) {
    const product = await Product.findById(item.product).select("price");
    console.log("product", product);
    if (product) {
      console.log("product.price", product.price);
      total += Number(product.price) * Number(item.quantity);
      console.log("total-->", total);
    }
  }
  this.total = total;
  return total;
};

cartSchema.methods.emptyValues = async function () {
  try {
    this.items = [];
    this.total = 0;
    await this.save();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
