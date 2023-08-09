const Cart = require("../../models/Cart.model");
const Order = require("../../models/Order.model");
const { Types, isValidObjectId } = require('mongoose')
const createError = require('http-errors')


const { v4: uuidv4 } = require("uuid");
const { Product } = require("../../models/Product");
const { log } = require("firebase-functions/logger");
const getCart = async (req, res) => {
  console.log("i am in getCart", req.user);
  try {
    // Retrieve the current user's shopping cart from the database
    console.log("i am in getCart", req.user);
    const user = req.user; // Assuming the user is authenticated and available in the request object
    const cart = await Cart.findOne({ user: user._id }).populate(
      "items.product"
    );

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ payload: null, message: error.message || "An error occurred" });
  }
};

const addItemToCart = async (req, res, next) => {
  console.log("i am in addCart", req.user);
  try {
    // Extract the product ID and quantity from the request body
    const { productId, quantity } = req.body;
    if (
      !productId ||
      !quantity ||
      Number(quantity) < 1 ||
      req.user === undefined
    ) {
      return res
        .status(400)
        .json({ payload: null, message: error.message || "An error occurred" });
    }

    // Retrieve the current user's shopping cart from the database
    const user = req.user; // Assuming the user is authenticated and available in the request object
    let cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      // If the cart doesn't exist, create a new one for the user
      cart = new Cart({ user: user._id, items: [] });
    }

    // Check if the product already exists in the cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // If the product already exists, update the quantity
      existingItem.quantity += parseInt(quantity);
    } else {
      // If the product doesn't exist, add it to the cart
      cart.items.push({ product: productId, quantity: parseInt(quantity) });
    }
    if (!isValidObjectId(productId)) {
      next(createError('ProductId is invalid'))
    }
    // const productForPrice = await Product.findById(productId).select("price");/

    const productForPrice = await Product.findById('64941d38825d2793151c9478')
    console.log(`++++++++++++++++++++++`, productForPrice);

    const orderValue = await cart.calculateTotal(productForPrice);
    cart.total = orderValue;
    console.log("cart total called", orderValue);
    // Save the updated cart to the database

    // cart.total = 0;
    // cart.items = [];

    await cart.save();

    res.status(201).json({ message: "Item added to cart successfully", cart });
  } catch (error) {
    res.status(500).json({ error: error, message: error.message });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    // Extract the item ID and quantity from the request parameters and body
    const { id } = req.params;
    const { quantity } = req.body;

    // Retrieve the current user's shopping cart from the database
    const user = req.user; // Assuming the user is authenticated and available in the request object
    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the item in the cart
    const item = cart.items.find((item) => item._id.toString() === id);

    if (!item) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    // Update the quantity of the item
    item.quantity = parseInt(quantity);

    // Save the updated cart to the database
    await cart.save();

    res
      .status(200)
      .json({ message: "Item quantity updated successfully", cart });
  } catch (error) {
    res
      .status(500)
      .json({ payload: null, message: error.message || "An error occurred" });
  }
};

const updateCartOrderState = async (req, res) => {
  try {
    // Extract the item ID and quantity from the request parameters and body
    const { orderId, statusState } = req.body;
    if (!orderId || !statusState) {
      return res.status(400).json({ error: "OrderId and status are required" });
    }
    // Retrieve the current user's shopping cart from the database
    const user = req.user; // Assuming the user is authenticated and available in the request object
    const order = await Order.findOne({ _id: orderId });
    console.log("order", orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    // Update the quantity of the item
    order.state = statusState;
    order.status = statusState;

    // Save the updated cart to the database
    await order.save();

    res
      .status(200)
      .json({ message: "statusState of order updated successfully", order });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ payload: null, message: error.message || "An error occurred" });
  }
};

const removeCartItem = async (req, res) => {
  try {
    // Extract the item ID from the request parameters
    const { id } = req.params;

    // Retrieve the current user's shopping cart from the database
    const user = req.user; // Assuming the user is authenticated and available in the request object
    const cart = await Cart.findOne({ user: user._id });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the index of the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === id
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);

    // Save the updated cart to the database
    await cart.save();

    res
      .status(200)
      .json({ message: "Item removed from cart successfully", cart });
  } catch (error) {
    res
      .status(500)
      .json({ payload: null, message: error.message || "An error occurred" });
  }
};

const processCheckout = async (req, res) => {
  try {
    const { address } = req.body;

    // Retrieve the current user's shopping cart from the database
    const user = req.user; // Assuming the user is authenticated and available in the request object
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const cart = await Cart.findOne({ user: user._id }).populate(
      "items.product"
    );

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    //  payment processing logic here
    // ...

    // Create an order based on the cart contents
    const orderValueFromCart = cart.total;

    if (orderValueFromCart === 0) {
      return res
        .status(404)
        .json({ message: "Cart is empty", error: cart.items });
    }
    console.log("orderValueFromCart", orderValueFromCart, cart);

    // Proceed to checkout with the "orderValue"

    const order = new Order({
      user: user._id,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      total: orderValueFromCart,
      orderId: uuidv4(),
      address: address || {
        addressLine: "addressLine",
        pincode: "pincode",
        city: "city",
        area: "area",
        country: "country",
        state: "state",
      },
    });

    const total = order.totalOrderValue;

    // // Save the order to the database
    await order.save();

    // Clear the user's shopping cart

    const cartShouldBeEmpty = await cart.emptyValues;
    await cart.save();
    if (cartShouldBeEmpty) {
      cart.items = []; // force empty the cart
      cart.total = 0; // force empty the cart
      await cart.save();
      res
        .status(201)
        .json({ message: "Order placed successfully", data: order });
    } else {
      res.status(200).json({
        message: "Order Created But Cart is not Empty",
        order,
        total,
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(501)
      .json({ payload: null, message: error.message || "An error occurred" });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  processCheckout,
  updateCartOrderState,
};
