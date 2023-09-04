const CoinPrice = require("../../models/Coins.model");
const GramPrice = require("../../models/GramPrice.model");

// Controller function to create a new gram price
const createGramPrice = async (req, res) => {
  try {
    const { type, price } = req.body;
    if (!type || !price)
      return res.status(400).json({ error: "Please fill all the fields" });
    console.log("type", type);
    console.log("price", price);
    // Get the current date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0

    // Find or create a document for the current day
    const existingGramPrice = await GramPrice.findOne({
      createdAt: today,
    });

    if (existingGramPrice) {
      // Update the price if the day is the same
      existingGramPrice.price = price;
      await existingGramPrice.save();
      res.status(200).json(existingGramPrice);
    } else {
      // Create a new document if the date changes
      const gramPrice = await GramPrice.findOneAndUpdate(
        { createdAt: today },
        { type, price },
        { upsert: true, new: true }
      );
      res.status(201).json(gramPrice);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "An error occurred",
    });
  }
};

// Controller function to get all coin prices
const getAllCoinPrices = async (req, res) => {
  try {
    const coinPrices = await CoinPrice.find();

    res.status(200).json({ coinPrices });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve coin prices",
      message: error.message,
    });
  }
};

// Controller function to get all gram prices
const getAllGramPrices = async (req, res) => {
  try {
    const gramPrices = await GramPrice.find();

    res.status(200).json({ gramPrices });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve gram prices",
      message: error.message,
    });
  }
};

// Controller function to get the last created coin price
const getLastCoinPrice = async (req, res) => {
  try {
    const coinPrice = await CoinPrice.findOne().sort({ createdAt: -1 });

    res.status(200).json({ coinPrice });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve last coin price",
      message: error.message,
    });
  }
};

// Controller function to get the last created gram price
const getLastGramPrice = async (req, res) => {
  try {
    const gramPrice = await GramPrice.findOne().sort({ createdAt: -1 });

    res.status(200).json({ gramPrice });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve last gram price",
      message: error.message,
    });
  }
};

const createCoinPrice = async (req, res) => {
  try {
    const { type, weight, makingCharges, status } = req.body;
    if (!type || !weight || !makingCharges || !status) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }
    // Get the current date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
    console.log("today", today);
    // Find or create a document for the current day
    const existingCoinPrice = await CoinPrice.findOne({
      createdAt: today,
    });

    if (existingCoinPrice) {
      // Update the existing weight if it already exists
      const existingWeightIndex = existingCoinPrice.weights.findIndex(
        (w) => w.weight === weight
      );
      console.log("existingWeightIndex", existingWeightIndex);
      if (existingWeightIndex !== -1) {
        existingCoinPrice.weights[existingWeightIndex].makingCharges =
          makingCharges;
        existingCoinPrice.weights[existingWeightIndex].status = status;
        await existingCoinPrice.save();
        res.status(200).json({
          payload: existingCoinPrice,
          message: "Coin price updated successfully",
        });
        return;
      }
    }

    // Add a new weight if it doesn't exist or create a new document
    const coinPrice = await CoinPrice.findOneAndUpdate(
      { createdAt: today },
      { $push: { weights: { weight, makingCharges, status } } },
      { upsert: true, new: true }
    );

    res.status(201).json({ payload: coinPrice, message: "Coin price added" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

const calculateTabledata = async (req, res) => {
  try {
    const coinPrice = await CoinPrice.findOne({ /* Add your query conditions if needed */ });

    if (!coinPrice) {
      return res.status(404).json({ message: "Coin price not found" });
    }

    const gramWeights = [1, 2, 5, 10, 20, 50, 100]; // Gram weights to calculate for
    const tableData = gramWeights.map(weight => {
      const weightInfo = coinPrice.weights.find(w => w.weight === weight);
      if (weightInfo) {
        const { makingCharges, gst } = weightInfo;
        const gramPrice = weightInfo.gramPrice || 0; // You need to replace this with your actual gram price value
        const netAmount = gramPrice * weight + makingCharges + gst;
        return {
          weight,
          gramPrice,
          makingCharges,
          gst,
          netAmount,
        };
      }
      return null;
    });

    res.status(200).json({ tableData });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }

}


module.exports = {
  createGramPrice,
  createCoinPrice,
  getAllCoinPrices,
  getAllGramPrices,
  getLastCoinPrice,
  getLastGramPrice,
  calculateTabledata
};
