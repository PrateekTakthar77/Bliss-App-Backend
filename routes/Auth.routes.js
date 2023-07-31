const express = require("express");
const {
  registerUser,
  logInUser,
  verifyUserEmailUsingOtp,
  resendOtp,
  adminLogin,
} = require("../controllers/Auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-user-otp", verifyUserEmailUsingOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", logInUser);
router.post("/admin/login", adminLogin);

module.exports = router;
