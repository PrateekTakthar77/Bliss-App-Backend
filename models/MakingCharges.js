const mongoose = require("mongoose");
const { Schema } = mongoose

const makingcharges = new mongoose.Schema({
    category: {
        type: String
    },
    subcategory: {
        type: String
    },
    makingcharges: {
        type: Number,
        required: true,
    },
});

const Making = mongoose.model("making", makingcharges);

module.exports = Making;