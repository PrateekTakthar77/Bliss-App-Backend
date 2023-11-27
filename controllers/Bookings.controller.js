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

const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.body
        console.log("Booking Deleted Sucessfully", bookingId);
        const booking = await Bookings.findByIdAndDelete(bookingId)
        res.json({ message: "Booking deleted successfully", booking });
    } catch (error) {
        res
            .status(500)
            .json({ payload: null, message: error.message || "An error occurred" });
    }
}
module.exports = { createBookings, getAllBookings, deleteBooking }