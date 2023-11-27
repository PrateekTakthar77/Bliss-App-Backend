const express = require("express");
const { accessAuth } = require("../middlewares/AccessAuth");
const { processCheckout } = require("../controllers/Cart/Cart");
const Order = require("../controllers/Cart/Order");
const { getOrderById, getAllOrders, updateOrder } = require('../controllers/Cart/Order')
const router = express.Router();

// Process the order and complete the payment bycart
router.post("/", accessAuth, processCheckout);

router.get("/order", accessAuth, getAllOrders);
// router.get("/:id", ordersController.getOrderById);
router.get("/order/:id", getOrderById);
router.post("/direct", Order.createOrder);
router.post("/discount", Order.applyDiscountToOrder);
router.put("/state/:id", updateOrder); // use _id 
router.post("/send", Order.sendMessage)
// router.delete("/:id", ordersController.cancelOrder);

module.exports = router;
