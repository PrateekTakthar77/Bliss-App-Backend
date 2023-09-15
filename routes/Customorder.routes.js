const express = require("express");
const customOrders = require("../controllers/customorder.controller");
const router = express.Router();
const { authorizeUser, accessAuth } = require("../middlewares/AccessAuth");

router.get("/", customOrders.getAll);
router.get("/:id", customOrders.getCustomOrderById);
router.post("/add", customOrders.addCustomOrder);
router.post("/bulk", accessAuth,
    authorizeUser(["Admin", "Dealer"]), customOrders.addBulkCustomOrders);
router.put("/state", customOrders.updateCartOrderState)

module.exports = router;