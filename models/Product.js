const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Category = mongoose.model("Category", categorySchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  mrp: { type: Number, required: true },
  price: { type: Number, required: true },
  images: [String],
  // category: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Category",
  //   required: true,
  // },
  category: { type: String },
  subcategory: { type: String },
  brand: String,
  material: String,
  size: String,
  weight: String,
  color: String,
  gemstones: [
    {
      name: String,
      carat: Number,
    },
  ],
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, required: true },
      comment: String,
    },
  ],
});

const Product = mongoose.model("Product", productSchema);

module.exports = { Product, Category };
