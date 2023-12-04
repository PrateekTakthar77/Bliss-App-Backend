const Cart = require("../../models/Cart.model");
const Order = require("../../models/Order.model");
const User = require("../../models/User.model");
const { Types, isValidObjectId } = require("mongoose");
const createError = require("http-errors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const { v4: uuidv4 } = require("uuid");
const { Product } = require("../../models/Product");
const { log } = require("firebase-functions/logger");
const { user } = require("firebase-functions/v1/auth");
const getCart = async (req, res) => {
  console.log("i am in getCart", req.user);
  try {
    // Retrieve the current user's shopping cart from the database
    console.log("i am in getCart", req.user);
    const user = req.user; // Assuming the user is authenticated and available in the request object
    const cart = await Cart.findOne({ user: user._id }).populate({
      path: "items.product",
      model: "product",
    });

    // .populate(
    //   "items.product"
    // );

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
      next(createError("ProductId is invalid"));
    }
    const productForPrice = await Product.findById(productId).select("price");

    // const productForPrice = await Product.findById('64941d38825d2793151c9478')
    // console.log(`++++++++++++++++++++++`, productForPrice);

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
    // console.log("hjhhjhjhjjhjhjhjhjhhjjhhj" + orderId)
    if (!orderId || !statusState) {
      return res.status(400).json({ error: "OrderId and status are required" });
    }
    // Retrieve the current user's shopping cart from the database
    // const user = await User.findById(user) // Assuming the user is authenticated and available in the request object
    const order = await Order.findOne({ _id: orderId });
    // console.log("order", orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Get the user ID from the order
    const userId = order.user;

    // Find the user by their ID and retrieve their email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the quantity of the item
    // order.state = statusState;
    order.status = statusState;
    // user's email
    const emailContent = `your orders has been updated ${order.status}`;
    const userEmail = user.email;
    await sendEmail(userEmail, "Email sent", emailContent);
    // console.log(
    //   `1231233333333333333333333333333333333333333333333333333`,
    //   userEmail
    // );

    const transporter = nodemailer.createTransport({
      service: "gmail",
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
        name: "Jewellery Bliss",
        address: process.env.USER,
      }, // sender address
      to: userEmail, // list of receivers
      subject: `Update on Your Recent Order with Jewellery Bliss`, // Subject line
      text: `
      your orders has been updated 
      Dear ${user.name},
      We hope this message finds you well. We wanted to provide you with an update on your recent order ID ${orderId} with Jewellery Bliss.
      Your Order Status: ${order.status}
      If you have any questions, or concerns, or require further assistance, please don't hesitate to reach out to our customer support team. We're here to ensure your shopping experience with Jewellery Bliss is exceptional.
      Thank you for choosing Jewellery Bliss. We look forward to serving you again in the future. `,
    };

    const sendMail = async (transporter, mailOptions) => {
      try {
        await transporter.sendMail(mailOptions);
        console.log("Mail Sent succesfully");
      } catch (error) {
        console.log(error);
      }
    };

    sendMail(transporter, mailOptions);

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
    // const user = req.user; // Assuming the user is authenticated and available in the request object
    const cart = await Cart.findOne({ user: req.user?._id });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === id
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found in cart" });
    }
    cart.items.forEach((item) => {
      console.log(item.product);
    });
    // Find the index of the item in the cart and filter it

    cart.items = cart.items.filter((item) => {
      return item.product.toString() !== id;
    });
    console.log("Removed item and now the cart is", cart);
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

    // const cart = await Cart.findOne({ user: user._id }).populate(
    //   "items.product"
    // );
    const cart = await Cart.findOne({ user: user._id }).populate({
      path: "items.product",
      model: "product",
    });

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
    const userEmail = user.email;
    console.log(`User Email:`, userEmail);
    const transporter = nodemailer.createTransport({
      service: "gmail",
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
        name: "Jewellery Bliss",
        address: process.env.USER,
      }, // sender address
      to: userEmail, // list of receivers
      subject: `Thank You for Your Purchase!`, // Subject line
      text: `Dear Customer,
      We want to express our heartfelt gratitude for choosing Jewellery Bliss for your recent purchase. Your trust in us means the world, and we're excited to have you as part of our valued customer family.
      Your Order Details:
      Order Number: #[Order Number]
      Date of Purchase: [Date of Purchase]
      We're thrilled that you've selected Jewellry Bliss, and we hope it brings you immense joy and satisfaction. Our team is dedicated to delivering top-notch quality and service, and your purchase reaffirms our commitment.
      If you have any questions or need assistance with your order, please don't hesitate to contact our friendly customer support team at [Customer Support Email/Phone]. We're here to help and ensure your experience with us is nothing short of excellent.
      Thank you once again for choosing Jewellery Bliss. We look forward to serving you in the future and providing you with even more exceptional products and services.
      Warm regards,
      [Your Name]
      Jewellery Bliss
      `
    };

    const sendMail = async (transporter, mailOptions) => {
      try {
        await transporter.sendMail(mailOptions);
        console.log("Mail Sent succesfully");
      } catch (error) {
        console.log(error);
      }
    };

    sendMail(transporter, mailOptions);
    // email: user.email,
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
