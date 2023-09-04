const Order = require("../../models/Order.model");
const { v4: uuidv4 } = require("uuid");
// Get a list of orders for the current user
const getAllOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ payload: null, message: error.message || "An error occurred prateek" });
  }
};

// Get a specific order by its ID
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ payload: null, message: error.message || "An error occurred" });
  }
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { userId, products, address } = req.body;
    console.log(userId, products, address);
    const order = new Order({ userId, products, address, orderId: uuidv4() });
    await order.save();
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ payload: null, message: error.message || "An error occurred" });
  }
};

// Update an order by its ID (e.g., update the shipping address)
const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { state } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { state },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ payload: null, message: error.message || "An error occurred" });
  }
};

// Cancel an order by its ID
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ payload: null, message: error.message || "An error occurred" });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
};
