const Premium = require("../models/Premium");

const createPremium = async (req, res) => {
    try {
        const { premiumcharges } = req.body;
        const premium = new Premium({ premiumcharges })
        await premium.save();
        return res.status(201).json(premium)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getAll = async (req, res) => {
    try {
        const premium = await Premium.find({});
        res.status(200).json(premium)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// update making charges
const getSingleByIdUpdate = async (req, res, next) => {
    try {
        const { id } = req.params;
        const premium = await Premium.findByIdAndUpdate(id, req.body)
        if (!premium) {
            res.status(403).json({ message: `cannot find any product with id ${id}` })
        }
        const updatedPremium = await Premium.findById(id);
        res.status(200).json(updatedPremium);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

module.exports = { getAll, createPremium, getSingleByIdUpdate };