// Update and add user details

const express = require("express");
const router = express.Router();

const {
  addUserDetails,
  updateUserDetails,
  getAllUserDetails,
  getUserDetailsById,
} = require("../controllers/UserDetails");
const { accessAuth } = require("../middlewares/AccessAuth");

// Route to get all user details
router.get("/", getAllUserDetails);
router.get("/:id", getUserDetailsById);
router.post("/add", accessAuth, addUserDetails);
router.put("/update", accessAuth, updateUserDetails);

module.exports = router;
