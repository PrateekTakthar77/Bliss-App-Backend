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
    const { user, items, address, total } = req.body;
    console.log(total, user, items, address);
    const order = new Order({ total, user, items, address, orderId: uuidv4() });
    // console.log(process.env.USER)
    // console.log(process.env.PASSWORD)
    // Get the user ID from the order
    const userId = user;

    const userdata = await User.findById(userId);
    if (!userdata) {
      return res.status(404).json({ error: "User not found" });
    }
    const userEmail = userdata.email;
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
      subject: "Thank You for Your Purchase!",
      text: `Dear ${userdata.name},
      We want to express our heartfelt gratitude for choosing Jewellery Bliss for your recent purchase. Your trust in us means the world, and we're excited to have you as part of our valued customer family.
      Your Order Details:
      Order Number: ${order.orderId}
      We're thrilled that you've selected Jewellery Bliss, and we hope it brings you immense joy and satisfaction. Our team is dedicated to delivering top-notch quality and service, and your purchase reaffirms our commitment.
      If you have any questions or need assistance with your order, please don't hesitate to contact our friendly customer support team at [Customer Support Email/Phone]. We're here to help and ensure your experience with us is nothing short of excellent.
      Thank you once again for choosing Jewellery Bliss. We look forward to serving you in the future and providing you with even more exceptional products and services.
      Warm regards,`,
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
      text: `Welcome to jewellery Bliss your Order has been sucessfull Updated to ${status}, enjoy your time on our APP` // plain text body
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

const sendMessage = async (req, res) => {
  try {
    const { orderId, message } = req.body;
    console.log(message)
    console.log(orderId)
    console.log(process.env.USER)
    // const orderId = req.params.id;
    const order = await Order.findByIdAndUpdate(
      orderId
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
      subject: "Message from jewellery Bliss", // Subject line
      text: message, // plain text body
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

    res.status(200).json({ message: "Order updated successfully", message, userEmail });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ payload: null, message: error.message || "An error occurred" });
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  applyDiscountToOrder,
  sendMessage
};
