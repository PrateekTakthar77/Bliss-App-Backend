const Making = require('../models/MakingCharges')

// Create a new making cahrge entry
const createMakingCharge = async (req, res) => {
    try {
        const { category, makingcharges, subcategory } = req.body;
        const margin = new Making({ category, makingcharges, subcategory });
        await margin.save();
        return res.status(201).json(margin);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
// get all MAking Charges
const getAll = async (req, res) => {
    try {
        const make = await Making.find({});
        res.status(200).json(make)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
// update making charges
const getSingleByIdUpdate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const making = await Making.findByIdAndUpdate(id, req.body)
        if (!making) {
            res.status(403).json({ message: `cannot find any product with id ${id}` })
        }
        const updatedMaking = await Making.findById(id);
        res.status(200).json(updatedMaking);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

module.exports = { createMakingCharge, getAll, getSingleByIdUpdate };