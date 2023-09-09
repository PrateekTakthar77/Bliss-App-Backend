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

module.exports = { addCustomOrder, getAll, addBulkCustomOrders };