const Customorder = require("../models/Customorder.model");
const addCustomOrder = async (req, res) => {
    try {
        const {
            images,
            material,
            size,
            weight,
            purity,
            typeofproduct,
            length,
            quantity,
            category,
            subcategory
        } = req.body;
        const custom = new Customorder({
            images,
            material,
            size,
            weight,
            purity,
            typeofproduct,
            length,
            quantity,
            category,
            subcategory
        });
        await custom.save();
        const user = req.user;
        res.status(201).json({ message: "Custom order added successfully", custom });
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ payload: null, message: error.message || "An error occurred" });
    }
};

const getAll = async (req, res) => {
    try {
        const orders = await Customorder.find({});
        res.status(200).json(orders)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const addBulkCustomOrders = async (req, res) => {
    try {
        const customOrdersData = req.body; // Assuming req.body is an array of custom orders

        // Create an array to store the saved custom orders
        const savedCustomOrders = [];

        // Loop through each custom order in the request
        for (const orderData of customOrdersData) {
            const {
                images,
                material,
                size,
                weight,
                purity,
                typeofproduct,
                length,
                quantity,
                category,
                subcategory
            } = orderData;

            // Create a new custom order instance
            const custom = new Customorder({
                images,
                material,
                size,
                weight,
                purity,
                typeofproduct,
                length,
                quantity,
                category,
                subcategory
            });

            // Save the custom order to the database
            const savedOrder = await custom.save();

            // Push the saved order to the array
            savedCustomOrders.push(savedOrder);
        }

        res.status(201).json({ message: "Bulk Custom orders added successfully", customOrders: savedCustomOrders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ payload: null, message: error.message || "An error occurred" });
    }
};

const getCustomOrderById = async (req, res) => {
    try {
        const orderId = req.params.id; // Assuming the _id is passed as a URL parameter
        const order = await Customorder.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const updateCartOrderState = async (req, res) => {
    try {
        // Extract the item ID and quantity from the request parameters and body
        const { orderId, status } = req.body;
        if (!orderId || !status) {
            return res.status(400).json({ error: "OrderId and status are required" });
        }
        // Retrieve the current user's shopping cart from the database
        // const user = await User.findById(user) // Assuming the user is authenticated and available in the request object
        const order = await Customorder.findOne({ _id: orderId });
        // console.log("order", orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Get the user ID from the order
        //   const userId = order.user;

        //   // Find the user by their ID and retrieve their email
        //   const user = await User.findById(userId);
        //   if (!user) {
        //     return res.status(404).json({ error: "User not found" });
        //   }

        // Update the quantity of the item
        // order.state = statusState;
        order.status = status;
        // user's email
        //   const emailContent = `your orders has been updated ${order.status}`
        //   const userEmail = user.email;
        //   await sendEmail(userEmail, "Email sent", emailContent)
        //   console.log(`1231233333333333333333333333333333333333333333333333333`, userEmail);

        //   const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     host: "smtp.gmail.com",
        //     port: 587,
        //     secure: false,
        //     auth: {
        //       user: process.env.USER,
        //       pass: process.env.PASSWORD,
        //     },
        //   });

        //   const mailOptions = {
        //     from: {
        //       name: 'Jewellery Bliss',
        //       address: process.env.USER
        //     }, // sender address
        //     to: userEmail, // list of receivers
        //     subject: "Welcome to jewellery Bliss", // Subject line
        //     text: `your orders has been updated ${order.status}`, // plain text body
        //     // html: "<b>Hello world?</b>", // html body
        //   };

        //   const sendMail = async (transporter, mailOptions) => {
        //     try {
        //       await transporter.sendMail(mailOptions)
        //       console.log("Mail Sent succesfully")
        //     } catch (error) {
        //       console.log(error);
        //     }
        //   }

        //   sendMail(transporter, mailOptions)

        // Save the updated cart to the database
        await order.save();

        res
            .status(200)
            .json({ message: "statusState of your custom order is updated successfully", order });
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ payload: null, message: error.message || "An error occurred" });
    }
};

module.exports = { addCustomOrder, getAll, addBulkCustomOrders, getCustomOrderById, updateCartOrderState };