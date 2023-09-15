const mongoose = require("mongoose");
const { Schema } = mongoose

const customOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    typeofproduct: String,
    images: [String],
    category: String,
    subcategory: String,
    material: String,
    purity: String,
    weight: String,
    length: Number,
    size: Number,
    quantity: Number,
    status: {
        type: String
    }
});

const Customorder = mongoose.model("Custom-Order", customOrderSchema);
module.exports = Customorder