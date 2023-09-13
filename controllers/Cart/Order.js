const Order = require("../../models/Order.model");
const { v4: uuidv4 } = require("uuid");
const User = require("../../models/User.model");
const nodemailer = require("nodemailer")
require("dotenv").config();
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
    const { user, items, address, total, email } = req.body;
    console.log(total, user, items, address);
    // const userEmail = user.email;
    console.log(`User Email:`, email);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: {
        name: 'Jewellery Bliss',
        address: process.env.USER
      }, // sender address
      to: email, // list of receivers
      subject: "Welcome to jewellery Bliss", // Subject line
      text: "Thank you for shooping at jewellery Bliss", // plain text body
      // html: "<b>Hello world?</b>", // html body
    };

    const sendMail = async (transporter, mailOptions) => {
      try {
        await transporter.sendMail(mailOptions)
        console.log("Mail Sent succesfully")
      } catch (error) {
        console.log(error);
      }
    }

    sendMail(transporter, mailOptions)
    const order = new Order({ total, user, items, address, orderId: uuidv4() });
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
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get the user ID from the order
    const userId = order.user;
    // Find the user by their ID and retrieve their email
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userEmail = user.email;
    console.log(`User Email:`, userEmail);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: {
        name: 'Jewellery Bliss',
        address: process.env.USER
      }, // sender address
      to: userEmail, // list of receivers
      subject: "Welcome to jewellery Bliss", // Subject line
      text: "Welcome to jewellery Bliss your Registration has been sucessfull, enjoy your time on our APP", // plain text body
      // html: "<b>Hello world?</b>", // html body
    };

    const sendMail = async (transporter, mailOptions) => {
      try {
        await transporter.sendMail(mailOptions)
        console.log("Mail Sent succesfully")
      } catch (error) {
        console.log(error);
      }
    }

    sendMail(transporter, mailOptions)

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

const applyDiscountToOrder = async (req, res) => {
  try {
    const { orderId, discountAmount } = req.body;

    // Retrieve the order by its orderId
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Calculate and apply the discount
    if (discountAmount <= 0) {
      return res.status(400).json({ message: 'Invalid discount amount' });
    }

    order.total -= discountAmount;

    // Save the updated order
    await order.save();

    res.status(200).json({ message: 'Discount applied successfully', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  applyDiscountToOrder
};
