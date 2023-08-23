const express = require("express");

const { forgotPassword } = require('../controllers/Auth2')
const router = express.Router();

// Add routes for forgot password and reset password
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);

module.exports = router;
