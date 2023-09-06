const Bookings = require("../models/Bookings.model");

const createBookings = async (req, res) => {
    try {
        const { name, phone, date } = req.body;
        const booking = new Bookings({ name, phone, date })
        await booking.save();
        return res.status(201).json(booking)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// get all MAking Charges
const getAllBookings = async (req, res) => {
    try {
        const book = await Bookings.find({});
        res.status(200).json(book)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { createBookings, getAllBookings }