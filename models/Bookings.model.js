const mongoose = require("mongoose")

const bookings = new mongoose.Schema({
    name: {
        type: String
    },
    phone: {
        type: Number
    },
    date: {
        type: Date
    }
})

const Bookings = mongoose.model("bookings", bookings);
module.exports = Bookings