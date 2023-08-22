const express = require("express");
const { accessAuth } = require("../middlewares/AccessAuth");
const { processCheckout } = require("../controllers/Cart/Cart");
const { ordersController } = require("../controllers/Cart/Order");
const { getOrderById, getAllOrders } = require('../controllers/Cart/Order')
const router = express.Router();

// Process the order and complete the payment bycart
router.post("/", accessAuth, processCheckout);

router.get("/order", accessAuth, getAllOrders);
// router.get("/:id", ordersController.getOrderById);
router.get("/order/:id", getOrderById);
// router.post("/direct", ordersController.createOrder);
// router.put("/:id", ordersController.updateOrder);
// router.delete("/:id", ordersController.cancelOrder);

module.exports = router;
