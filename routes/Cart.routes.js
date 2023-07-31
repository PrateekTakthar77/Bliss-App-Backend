const express = require("express");
const router = express.Router();

const { accessAuth, authorizeUser } = require("../middlewares/AccessAuth");
const CartController = require("./../controllers/Cart/Cart");

// Get the current user's shopping cart
router.get("/", accessAuth, CartController.getCart);

// Add an item to the shopping cart
router.post(
  "/items",
  accessAuth,
  authorizeUser(["Customer", "Dealer"]),
  CartController.addItemToCart
);

// Update the quantity of an item in the shopping cart
router.put("/items/:id", accessAuth, CartController.updateCartItemQuantity);

// update the state of an order
router.put(
  "/orders/:id",
  accessAuth,
  authorizeUser(["Admin"]),
  CartController.updateCartOrderState
);

// Remove an item from the shopping cart
router.delete("/items/:id", accessAuth, CartController.removeCartItem);

module.exports = router;
