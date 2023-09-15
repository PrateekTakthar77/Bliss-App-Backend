const express = require("express");
const { accessAuth, authorizeUser } = require("../middlewares/AccessAuth");
const Bookings = require("../controllers/Bookings.controller");
const router = express.Router();

router.post("/make", Bookings.createBookings);
router.get('/', Bookings.getAllBookings);
router.delete("/delete", Bookings.deleteBooking);
module.exports = router;