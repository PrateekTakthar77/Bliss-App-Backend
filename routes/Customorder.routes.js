const express = require("express");
const customOrders = require("../controllers/customorder.controller");
const router = express.Router();
const { authorizeUser, accessAuth } = require("../middlewares/AccessAuth");

router.get("/", customOrders.getAll);
router.post("/add", accessAuth,
    authorizeUser(["Admin", "Dealer"]), customOrders.addCustomOrder);
router.post("/bulk", accessAuth,
    authorizeUser(["Admin", "Dealer"]), customOrders.addBulkCustomOrders);

module.exports = router;